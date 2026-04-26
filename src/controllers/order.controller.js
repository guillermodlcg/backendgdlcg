import Order from "../models/order.models.js";
import Products from "../models/product.models.js";

//Crear una nueva orden
export const createOrder = async (req, res) => {
  try {
    const { items, subTotal, iva, total, totalProducts, paymentMethod } = req.body;
    
    //Validar que haya suficiente stock para cada producto
    for (const item of items) {
      const product = await Products.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Producto con id ${item.productId} no encontrado` });
      }
      const requestedQty = parseInt(item.quantity) || 0;
      if (product.quantity < requestedQty) {
        return res.status(400).json({ 
          message: `Stock insuficiente para ${product.name}. Disponible: ${product.quantity}, Solicitado: ${requestedQty}` 
        });
      }
    }

    //Crear la orden
    const newOrder = new Order({
      user: req.user.id,
      items,
      subTotal,
      iva,
      total,
      totalProducts,
      paymentMethod,
      status: 'received'
    });

    const savedOrder = await newOrder.save();

    //Actualizar el stock de cada producto
    for (const item of items) {
      await Products.findByIdAndUpdate(
        item.productId,
        { $inc: { quantity: -(parseInt(item.quantity) || 0) } },
        { new: true }
      );
    }

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Error al crear orden:", error);
    res.status(500).json({ message: error.message });
  }
};

//Actualizar el estado de una orden
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    // Verificar permisos: admin puede cambiar cualquier orden, usuario solo las suyas
    const isOwner = order.user.toString() === req.user.id;
    const isAdmin = req.user.roles && req.user.roles.some(role => 
      role.name === 'admin' || role === 'admin'
    );
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "No tienes permiso para modificar esta orden" });
    }

    const validStatuses = ['received', 'confirmed', 'cancelled', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Estado inválido" });
    }

    if (!isAdmin && status === 'cancelled' && order.status === 'delivered') {
      return res.status(400).json({ message: "No se puede cancelar una orden entregada" });
    }

    const previousStatus = order.status;

    // RESTORE stock: confirmed → cancelled
    // Stock was already discounted at order creation (received), so only restore
    // if the order was confirmed and is now being cancelled.
    if (previousStatus === 'confirmed' && status === 'cancelled') {
      for (const item of order.items) {
        const qty = parseInt(item.quantity) || 0;
        if (qty > 0) {
          await Products.findByIdAndUpdate(
            item.productId,
            { $inc: { quantity: qty } },
            { new: true }
          );
        }
      }
      console.log('[ORDER] Stock restored for cancelled order:', req.params.id);
    }

    // RESTORE stock: received → cancelled
    // Stock was discounted at creation even for received status, so restore it.
    if (previousStatus === 'received' && status === 'cancelled') {
      for (const item of order.items) {
        const qty = parseInt(item.quantity) || 0;
        if (qty > 0) {
          await Products.findByIdAndUpdate(
            item.productId,
            { $inc: { quantity: qty } },
            { new: true }
          );
        }
      }
      console.log('[ORDER] Stock restored for cancelled (from received) order:', req.params.id);
    }

    order.status = status;
    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } catch (error) {
    console.error("Error en updateOrderStatus:", error);
    res.status(500).json({ message: error.message });
  }
};

//Obtener todas las ordenes (solo admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'username email')
      .sort({ createdAt: -1 }); // Ordenar por fecha de creación descendente
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Obtener ordenes de un usuario específico
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('user', 'username email')
      .sort({ createdAt: -1 }); // Ordenar por fecha de creación descendente
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Obtener una orden por ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'username email');
    
    if (!order) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    //Verificar que el usuario sea el dueño de la orden o sea admin
    if (order.user._id.toString() !== req.user.id && !req.user.roles.includes('admin')) {
      return res.status(403).json({ message: "No tienes permiso para ver esta orden" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Eliminar una orden (solo admin)
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    // Verificar que el usuario sea el dueño de la orden o sea admin
    const isOwner = order.user.toString() === req.user.id;
    const isAdmin = req.user.roles.includes('admin');
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "No tienes permiso para eliminar esta orden" });
    }

    // Solo permitir eliminar órdenes canceladas (excepto admin)
    if (order.status !== 'cancelled' && !isAdmin) {
      return res.status(400).json({ message: "Solo se pueden eliminar órdenes canceladas" });
    }

    await Order.findByIdAndDelete(req.params.id);

    res.json({ message: "Orden eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};