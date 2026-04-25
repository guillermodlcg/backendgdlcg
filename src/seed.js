import mongoose from 'mongoose';
import Product from './models/product.models.js';
import User from './models/user.models.js';
import Role from './models/roles.models.js';
import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';

dotenv.config();

export const runSeedIfEmpty = async () => {
    try {
        const productCount = await Product.countDocuments();
        if (productCount > 0) {
            console.log(`✅ BD ya tiene ${productCount} productos, semilla omitida.`);
            return;
        }
        console.log('🌱 BD vacía, ejecutando semilla...');

        const adminRole = await Role.create({ role: 'admin' });
        await Role.create({ role: 'user' });
        console.log('📝 Roles creados (admin, user)');

        const hashedPassword = await bcryptjs.hash('admin123', 10);
        const adminUser = await User.create({
            username: 'admin',
            email: 'admin@gdlcg.com',
            password: hashedPassword,
            role: adminRole._id
        });
        console.log('👤 Usuario administrador creado: admin / admin123');

        await Product.deleteMany({});
        console.log('🗑️ Productos anteriores eliminados');

        const products = [
            // TOPS
            {
                name: 'Top Deportivo Dark Knight',
                description: 'Top de alto impacto en color negro mate con tecnología dry-fit.',
                price: 749.00, quantity: 40,
                categoria: 'tops', tallas: ['XS', 'S', 'M', 'L'],
                colores: ['Negro'],
                image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=800',
                user: adminUser._id
            },
            {
                name: 'Top Platinum Performance',
                description: 'Top deportivo con acabado platinado y soporte medio impacto.',
                price: 699.00, quantity: 35,
                categoria: 'tops', tallas: ['XS', 'S', 'M'],
                colores: ['Platino', 'Blanco'],
                image: 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800',
                user: adminUser._id
            },
            {
                name: 'Top Gris Steel',
                description: 'Top sin mangas de compresión ligera en gris metálico.',
                price: 599.00, quantity: 45,
                categoria: 'tops', tallas: ['S', 'M', 'L'],
                colores: ['Gris'],
                image: 'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=800',
                user: adminUser._id
            },

            // LEGGINGS
            {
                name: 'Leggings Platinum Elite',
                description: 'Leggings de compresión con acabado platinado y tecnología de secado rápido.',
                price: 1299.00, quantity: 50,
                categoria: 'leggings', tallas: ['XS', 'S', 'M', 'L'],
                colores: ['Platino', 'Gris'],
                image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800',
                user: adminUser._id
            },
            {
                name: 'Leggings Black Shadow',
                description: 'Leggings negros de alto rendimiento con cintura alta y bolsillo lateral.',
                price: 1199.00, quantity: 60,
                categoria: 'leggings', tallas: ['XS', 'S', 'M', 'L', 'XL'],
                colores: ['Negro'],
                image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800',
                user: adminUser._id
            },
            {
                name: 'Leggings White Edition',
                description: 'Leggings blancos con tejido opaco y tecnología anti-transparencia.',
                price: 1099.00, quantity: 30,
                categoria: 'leggings', tallas: ['S', 'M', 'L'],
                colores: ['Blanco'],
                image: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=800',
                user: adminUser._id
            },

            // SHORTS
            {
                name: 'Shorts Mesh Platinum',
                description: 'Shorts transpirables con malla interior y acabado platinado.',
                price: 699.00, quantity: 40,
                categoria: 'shorts', tallas: ['S', 'M', 'L', 'XL'],
                colores: ['Platino', 'Gris'],
                image: 'https://images.unsplash.com/photo-1562886877-f93f8b9a5e8e?w=800',
                user: adminUser._id
            },
            {
                name: 'Shorts Dark Runner',
                description: 'Shorts negros de running con bolsillos laterales y corte atlético.',
                price: 649.00, quantity: 50,
                categoria: 'shorts', tallas: ['S', 'M', 'L', 'XL'],
                colores: ['Negro'],
                image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800',
                user: adminUser._id
            },

            // SUDADERAS
            {
                name: 'Sudadera GDLCG Tech',
                description: 'Sudadera premium color gris carbón con detalles reflectantes.',
                price: 1599.00, quantity: 30,
                categoria: 'sudaderas', tallas: ['S', 'M', 'L', 'XL'],
                colores: ['Gris', 'Negro'],
                image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800',
                user: adminUser._id
            },
            {
                name: 'Sudadera Platinum Hood',
                description: 'Hoodie con capucha en tono platino, interior afelpado y bolsillo canguro.',
                price: 1799.00, quantity: 25,
                categoria: 'sudaderas', tallas: ['S', 'M', 'L', 'XL', 'XXL'],
                colores: ['Platino'],
                image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800',
                user: adminUser._id
            },
            {
                name: 'Sudadera Black Elite',
                description: 'Sudadera negra sin capucha de corte slim con logo GDLCG bordado.',
                price: 1499.00, quantity: 35,
                categoria: 'sudaderas', tallas: ['S', 'M', 'L', 'XL'],
                colores: ['Negro'],
                image: 'https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=800',
                user: adminUser._id
            },

            // PANTS
            {
                name: 'Pants Jogger Platinum',
                description: 'Pants jogger con puños ajustables y acabado platinado.',
                price: 1399.00, quantity: 30,
                categoria: 'pants', tallas: ['S', 'M', 'L', 'XL'],
                colores: ['Platino', 'Gris'],
                image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800',
                user: adminUser._id
            },
            {
                name: 'Pants Dark Training',
                description: 'Pants negros de entrenamiento con bolsillos con cierre y corte recto.',
                price: 1299.00, quantity: 40,
                categoria: 'pants', tallas: ['S', 'M', 'L', 'XL', 'XXL'],
                colores: ['Negro'],
                image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800',
                user: adminUser._id
            },
            {
                name: 'Pants White Performance',
                description: 'Pants blancos de alto rendimiento con franja lateral gris.',
                price: 1199.00, quantity: 25,
                categoria: 'pants', tallas: ['S', 'M', 'L'],
                colores: ['Blanco', 'Gris'],
                image: 'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=800',
                user: adminUser._id
            },

            // CALZADO
            {
                name: 'Tenis Phantom Silver',
                description: 'Calzado para running con amortiguación avanzada y color plata metálico.',
                price: 2499.00, quantity: 20,
                categoria: 'calzado', tallas: ['24', '25', '26', '27', '28'],
                colores: ['Plata', 'Blanco'],
                image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
                user: adminUser._id
            },
            {
                name: 'Tenis Dark Runner Pro',
                description: 'Tenis negros de alto rendimiento con suela de carbono.',
                price: 2799.00, quantity: 15,
                categoria: 'calzado', tallas: ['24', '25', '26', '27', '28', '29'],
                colores: ['Negro'],
                image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
                user: adminUser._id
            },
            {
                name: 'Tenis Platinum Training',
                description: 'Calzado de entrenamiento con soporte lateral y diseño platinado.',
                price: 2199.00, quantity: 25,
                categoria: 'calzado', tallas: ['23', '24', '25', '26', '27'],
                colores: ['Platino', 'Gris'],
                image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800',
                user: adminUser._id
            },

            // ACCESORIOS
            {
                name: 'Banda Deportiva GDLCG',
                description: 'Banda para cabeza antideslizante en colores de la marca.',
                price: 199.00, quantity: 80,
                categoria: 'accesorios', tallas: ['Único'],
                colores: ['Negro', 'Gris', 'Platino'],
                image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
                user: adminUser._id
            },
            {
                name: 'Mochila Training Pack',
                description: 'Mochila deportiva impermeable con compartimento para laptop.',
                price: 899.00, quantity: 20,
                categoria: 'accesorios', tallas: ['Único'],
                colores: ['Negro', 'Gris'],
                image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
                user: adminUser._id
            },
            {
                name: 'Guantes Gym Pro',
                description: 'Guantes de gimnasio con palma acolchada y muñequera de soporte.',
                price: 349.00, quantity: 50,
                categoria: 'accesorios', tallas: ['S', 'M', 'L'],
                colores: ['Negro', 'Platino'],
                image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800',
                user: adminUser._id
            }
        ];

        const createdProducts = await Product.insertMany(products);
        console.log(`✅ ${createdProducts.length} productos creados exitosamente!`);

        const categoryCounts = await Product.aggregate([
            { $group: { _id: '$categoria', count: { $sum: 1 } } }
        ]);

        console.log('\n📊 Resumen por categoría:');
        categoryCounts.forEach(cat => {
            console.log(`   ${cat._id}: ${cat.count} productos`);
        });

        console.log('\n🎉 Seed completado exitosamente!');
    } catch (error) {
        console.error('❌ Error en semilla:', error);
    }
};
