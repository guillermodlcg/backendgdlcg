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
      if (product.quantity < item.quantity) {
        return res.status(400).json({ 
          message: `Stock insuficiente para ${product.name}. Disponible: ${product.quantity}, Solicitado: ${item.quantity}` 
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
        { $inc: { quantity: -item.quantity } },
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
    
    console.log("Usuario:", req.user);
    console.log("Body:", req.body);
    
    // Obtener la orden primero para validar permisos
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    console.log("Orden encontrada:", order);

    // Verificar permisos: admin puede cambiar cualquier orden, usuario solo las suyas
    const isOwner = order.user.toString() === req.user.id;
    const isAdmin = req.user.roles && req.user.roles.some(role => 
      role.name === 'admin' || role === 'admin'
    );
    
    console.log("isOwner:", isOwner, "isAdmin:", isAdmin);
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "No tienes permiso para modificar esta orden" });
    }

    // Validar que el estado sea válido
    const validStatuses = ['received', 'confirmed', 'cancelled', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Estado inválido" });
    }

    // Usuario normal solo puede cancelar su propia orden si no está entregada
    if (!isAdmin && status === 'cancelled' && order.status === 'delivered') {
      return res.status(400).json({ message: "No se puede cancelar una orden entregada" });
    }

    // Actualizar el estado
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(updatedOrder);
  } catch (error) {
    console.error("Error en updateOrderStatus:", error);
    res.status(500).json({ message: error.message });
  }
};

//Obtener todas las ordenes (solo admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'username email');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Obtener ordenes de un usuario específico
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id });
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