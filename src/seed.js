import mongoose from 'mongoose';
import Product from './models/product.models.js';
import User from './models/user.models.js';
import Role from './models/roles.models.js';
import dotenv from 'dotenv';

dotenv.config();

// Conectar a la base de datos
mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log('✅ Conectado a MongoDB'))
    .catch(err => {
        console.error('❌ Error conectando a MongoDB:', err);
        process.exit(1);
    });

const seedProducts = async () => {
    try {
        // Buscar un usuario para asignar los productos
        let adminUser = await User.findOne();

        // Si no hay ningún usuario, crear uno temporal
        if (!adminUser) {
            console.log('⚠️ No hay usuarios en la base de datos. Creando usuario temporal...');
            
            // Buscar o crear rol admin
            let adminRole = await Role.findOne({ name: 'admin' });
            if (!adminRole) {
                adminRole = await Role.create({ name: 'admin' });
                console.log('📝 Rol admin creado');
            }
            
            adminUser = await User.create({
                username: 'admin',
                email: 'admin@oldchick.com',
                password: 'admin123',
                roles: [adminRole._id]
            });
            console.log('👤 Usuario admin temporal creado');
        }

        console.log(`👤 Usando usuario: ${adminUser.username}`);

        // Limpiar productos existentes (opcional)
        await Product.deleteMany({});
        console.log('🗑️ Productos anteriores eliminados');

        // Productos de prueba
        const products = [
            // VESTIDOS
            {
                name: 'Vestido Floral Verano',
                description: 'Hermoso vestido floral perfecto para el verano, con corte A y manga corta.',
                price: 899.99,
                quantity: 15,
                categoria: 'vestidos',
                tallas: ['S', 'M', 'L', 'XL'],
                colores: ['Azul', 'Rosa', 'Blanco'],
                image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500',
                user: adminUser._id
            },
            {
                name: 'Vestido de Noche Elegante',
                description: 'Vestido largo de noche con diseño elegante y sofisticado, ideal para eventos especiales.',
                price: 1599.99,
                quantity: 8,
                categoria: 'vestidos',
                tallas: ['XS', 'S', 'M', 'L'],
                colores: ['Negro', 'Rojo', 'Azul Marino'],
                image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500',
                user: adminUser._id
            },
            {
                name: 'Vestido Casual Algodón',
                description: 'Vestido casual de algodón cómodo para uso diario, con bolsillos laterales.',
                price: 599.99,
                quantity: 20,
                categoria: 'vestidos',
                tallas: ['S', 'M', 'L', 'XL', 'XXL'],
                colores: ['Gris', 'Beige', 'Verde'],
                image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500',
                user: adminUser._id
            },

            // BLUSAS
            {
                name: 'Blusa de Seda Elegante',
                description: 'Blusa de seda suave con cuello en V, perfecta para la oficina o eventos formales.',
                price: 749.99,
                quantity: 12,
                categoria: 'blusas',
                tallas: ['XS', 'S', 'M', 'L'],
                colores: ['Blanco', 'Negro', 'Champagne'],
                image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500',
                user: adminUser._id
            },
            {
                name: 'Blusa Campesina Bordada',
                description: 'Blusa estilo campesino con bordados artesanales y mangas amplias.',
                price: 549.99,
                quantity: 18,
                categoria: 'blusas',
                tallas: ['S', 'M', 'L', 'XL'],
                colores: ['Blanco', 'Azul', 'Rosa'],
                image: 'https://images.unsplash.com/photo-1580657018950-c7f7d6a6d990?w=500',
                user: adminUser._id
            },

            // PANTALONES
            {
                name: 'Jeans Skinny Clásicos',
                description: 'Jeans skinny de mezclilla elástica para máxima comodidad y estilo.',
                price: 899.99,
                quantity: 25,
                categoria: 'pantalones',
                tallas: ['XS', 'S', 'M', 'L', 'XL'],
                colores: ['Azul Oscuro', 'Negro', 'Gris'],
                image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500',
                user: adminUser._id
            },
            {
                name: 'Pantalón de Vestir',
                description: 'Pantalón de vestir elegante de corte recto, ideal para look profesional.',
                price: 799.99,
                quantity: 15,
                categoria: 'pantalones',
                tallas: ['S', 'M', 'L', 'XL'],
                colores: ['Negro', 'Beige', 'Gris Oscuro'],
                image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500',
                user: adminUser._id
            },

            // FALDAS
            {
                name: 'Falda Plisada Midi',
                description: 'Falda plisada de largo midi, perfecta para looks elegantes y femeninos.',
                price: 649.99,
                quantity: 14,
                categoria: 'faldas',
                tallas: ['XS', 'S', 'M', 'L'],
                colores: ['Negro', 'Vino', 'Azul Marino'],
                image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=500',
                user: adminUser._id
            },
            {
                name: 'Falda Denim Corta',
                description: 'Falda corta de mezclilla con diseño moderno y juvenil.',
                price: 499.99,
                quantity: 20,
                categoria: 'faldas',
                tallas: ['S', 'M', 'L', 'XL'],
                colores: ['Azul Claro', 'Negro'],
                image: 'https://images.unsplash.com/photo-1580657018950-c7f7d6a6d990?w=500',
                user: adminUser._id
            },

            // TRAJES
            {
                name: 'Conjunto Blazer y Pantalón',
                description: 'Set ejecutivo de blazer y pantalón a juego, corte moderno y elegante.',
                price: 1899.99,
                quantity: 10,
                categoria: 'trajes',
                tallas: ['S', 'M', 'L', 'XL'],
                colores: ['Negro', 'Gris', 'Azul Marino'],
                image: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=500',
                user: adminUser._id
            },

            // ABRIGOS
            {
                name: 'Abrigo Largo de Lana',
                description: 'Abrigo elegante de lana para invierno, con botones y bolsillos laterales.',
                price: 2199.99,
                quantity: 8,
                categoria: 'abrigos',
                tallas: ['S', 'M', 'L'],
                colores: ['Camel', 'Negro', 'Gris'],
                image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500',
                user: adminUser._id
            },
            {
                name: 'Chamarra Denim Oversized',
                description: 'Chamarra de mezclilla estilo oversized, perfecta para looks casuales.',
                price: 899.99,
                quantity: 16,
                categoria: 'abrigos',
                tallas: ['S', 'M', 'L', 'XL'],
                colores: ['Azul', 'Negro', 'Blanco'],
                image: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=500',
                user: adminUser._id
            },

            // ACCESORIOS (sin tallas requeridas)
            {
                name: 'Bolsa Crossbody Cuero',
                description: 'Elegante bolsa crossbody de cuero sintético con cadena dorada.',
                price: 799.99,
                quantity: 12,
                categoria: 'accesorios',
                tallas: ['Único'],
                colores: ['Negro', 'Café', 'Rojo'],
                image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500',
                user: adminUser._id
            },
            {
                name: 'Collar de Perlas',
                description: 'Hermoso collar de perlas sintéticas, elegante y atemporal.',
                price: 349.99,
                quantity: 25,
                categoria: 'accesorios',
                tallas: [],
                colores: ['Blanco', 'Crema'],
                image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500',
                user: adminUser._id
            },
            {
                name: 'Aretes Dorados Minimalistas',
                description: 'Set de aretes dorados con diseño minimalista y moderno.',
                price: 199.99,
                quantity: 30,
                categoria: 'accesorios',
                tallas: [],
                colores: ['Dorado', 'Plateado', 'Oro Rosa'],
                image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500',
                user: adminUser._id
            },
            {
                name: 'Bufanda de Lana',
                description: 'Bufanda tejida de lana suave, perfecta para el invierno.',
                price: 299.99,
                quantity: 20,
                categoria: 'accesorios',
                tallas: ['Único'],
                colores: ['Gris', 'Beige', 'Negro', 'Vino'],
                image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=500',
                user: adminUser._id
            },
            {
                name: 'Cinturón Cuero Trenzado',
                description: 'Cinturón de cuero trenzado con hebilla metálica.',
                price: 399.99,
                quantity: 15,
                categoria: 'accesorios',
                tallas: ['Pequeño', 'Mediano', 'Grande'],
                colores: ['Café', 'Negro'],
                image: 'https://images.unsplash.com/photo-1624222247344-550fb60583bb?w=500',
                user: adminUser._id
            }
        ];

        // Insertar productos
        const createdProducts = await Product.insertMany(products);
        console.log(`✅ ${createdProducts.length} productos creados exitosamente!`);
        
        // Mostrar resumen
        const categoryCounts = await Product.aggregate([
            { $group: { _id: '$categoria', count: { $sum: 1 } } }
        ]);
        
        console.log('\n📊 Resumen por categoría:');
        categoryCounts.forEach(cat => {
            console.log(`   ${cat._id}: ${cat.count} productos`);
        });

        console.log('\n🎉 Seed completado exitosamente!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creando productos:', error);
        process.exit(1);
    }
};

seedProducts();
