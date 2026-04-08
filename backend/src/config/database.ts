import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { 
  User, Address, Product, Category, Testimonial, 
  Combo, Order, Content, Legal, Settings, DEFAULT_SETTINGS 
} from '../models/index.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dona-yoli';
const DEFAULT_DELIVERY_FEE = 100;

class Database {
  async connect(): Promise<void> {
    try {
      await mongoose.connect(MONGO_URI);
      console.log('Connected to MongoDB');
      await this.seed();
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  private async seed(): Promise<void> {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already seeded');
      return;
    }

    console.log('Seeding database...');
    const hashedPassword = await bcrypt.hash('4dminRoot', 10);

    await User.create({
      email: 'admin@dona-yoli.com',
      password: hashedPassword,
      name: 'Admin Doña Yoli',
      phone: '+57 300 000 0000',
      role: 'admin'
    });

    await Category.insertMany([
      { id: 'cafeteria', name: 'Cafetería', description: 'Cafés, pastelería y desayunos', image: '/imgs/photo-1509042239860-f550ce710b93.jfif', icon: 'fa-mug-hot' },
      { id: 'pizzeria', name: 'Pizzería', description: 'Masas artesanales y toppings', image: '/imgs/photo-1513104890138-7c749659a591.jfif', icon: 'fa-pizza-slice' },
      { id: 'despensa', name: 'Despensa', description: 'Harinas, aceites y empacados', image: '/imgs/photo-1542838132-92c53300491e.jfif', icon: 'fa-basket-shopping' }
    ]);

    await Product.insertMany([
      { name: 'Combo Familiar Doña Yoli', description: '2 Pizzas Grandes + 1 Litro de Gaseosa + 1 Postre. Ideal para compartir en familia.', price: 55000, category: 'combo', image: '/imgs/photo-1574071318508-1cdbab80d002.jfif', isFeatured: true, isHot: true, isCombo: true, stock: 50 },
      { name: 'Combo Desayuno Completo', description: '2 Cafés + 2 Croissants + 1 Jugo natural. El mejor comienzo del día.', price: 28000, category: 'combo', image: '/imgs/photo-1509042239860-f550ce710b93.jfif', isFeatured: true, isCombo: true, stock: 50 },
      { name: 'Combo Pizza + Refresco', description: '1 Pizza mediana + 2 Refrescos. Perfecto para una comida rápida.', price: 42000, category: 'combo', image: '/imgs/photo-1565299624946-b28f40a0ae38.jfif', isCombo: true, stock: 50 },
      { name: 'Combo Despensa Básica', description: 'Harina 1kg + Arroz 1kg + Aceite 500ml + Fideos. Lo esencial para tu cocina.', price: 35000, category: 'combo', image: '/imgs/photo-1542838132-92c53300491e.jfif', isFeatured: true, isCombo: true, stock: 50 },
      { name: 'Pizza Pepperoni', description: 'Masa madre, salsa de la casa, mozzarella y pepperoni crujiente.', price: 35000, category: 'pizzeria', image: '/imgs/photo-1574071318508-1cdbab80d002.jfif', isFeatured: true, isHot: true, stock: 100 },
      { name: 'Latte Caramel', description: 'Espresso doble, leche vaporizada y jarabe de caramelo artesanal.', price: 12000, category: 'cafeteria', image: '/imgs/photo-1514432324607-a09d9b4aefdd.jfif', isFeatured: true, stock: 100 },
      { name: 'Harina de Trigo 1kg', description: 'Harina premium para todo uso, ideal para panadería y repostería.', price: 4500, category: 'despensa', image: '/imgs/photo-1620916566398-39f1143ab7be.jfif', isFeatured: true, stock: 200 },
      { name: 'Aceite de Oliva 500ml', description: 'Aceite extra virgen, primera presión en frío. Calidad superior.', price: 28000, category: 'despensa', image: '/imgs/photo-1474979266404-7eaacbcd87c5.jfif', isFeatured: true, stock: 80 },
      { name: 'Pastel de Chocolate', description: 'Porción individual de pastel húmedo con ganache de chocolate.', price: 15000, category: 'cafeteria', image: '/imgs/photo-1551024709-8f23befc6f87.jfif', isFeatured: true, stock: 50 },
      { name: 'Pizza Vegetariana', description: 'Pimientos, cebolla, champiñones, aceitunas y queso mozzarella.', price: 32000, category: 'pizzeria', image: '/imgs/photo-1565299624946-b28f40a0ae38.jfif', isFeatured: true, stock: 100 },
      { name: 'Arroz Premium 1kg', description: 'Grano seleccionado, libre de impurezas. Rendimiento superior.', price: 3800, category: 'despensa', image: '/imgs/photo-1620916566398-39f1143ab7be.jfif', isFeatured: true, stock: 200 },
      { name: 'Cupcake Vainilla', description: 'Esponjoso cupcake de vainilla con frosting de crema de mantequilla.', price: 8000, category: 'cafeteria', image: '/imgs/photo-1550617931-e17a7b70dce2.jfif', isFeatured: true, stock: 50 }
    ]);

    await Testimonial.insertMany([
      { name: 'María Rodríguez', role: 'Cliente Frecuente', comment: 'La mejor pizza de la ciudad. La masa es increíble y los ingredientes de la despensa también son muy buenos.', rating: 5, initials: 'MR' },
      { name: 'Juan Pérez', role: 'Amante de la Cocina', comment: 'Compro aquí mis harinas y aceites porque sé que son de calidad. El servicio es rápido y amable.', rating: 5, initials: 'JP' },
      { name: 'Laura Castro', role: 'Estudiante', comment: 'El café es delicioso, perfecto para trabajar en la tarde. Los pasteles son un plus increíble.', rating: 4.5, initials: 'LC' }
    ]);

    await Combo.insertMany([
      { name: 'Combo Familiar Doña Yoli', description: 'Lleva 2 Pizzas Grandes + 1 Litro de Gaseosa + 1 Postre de la casa por un precio especial. Ideal para compartir en familia.', price: 55000, image: '/imgs/photo-1574071318508-1cdbab80d002.jfif', includes: ['Ingredientes frescos', 'Entrega a domicilio', 'Precio especial solo hoy'], isFeatured: true }
    ]);

    await Content.insertMany([
      { key: 'home_hero_title', value: 'Bienvenido a Doña Yoli', type: 'text' },
      { key: 'home_hero_subtitle', value: 'Los mejores productos de cafetería, pizza y despensa', type: 'text' },
      { key: 'contact_phone', value: '+57 300 123 4567', type: 'text' },
      { key: 'contact_email', value: 'contacto@dona-yoli.com', type: 'text' },
      { key: 'contact_address', value: 'Calle Principal #123, Ciudad', type: 'text' }
    ]);

    await Legal.insertMany([
      {
        type: 'terms',
        title: 'Términos y Condiciones',
        content: `<h2>Términos y Condiciones de Uso</h2>
<p>Bienvenido a Doña Yoli. Al acceder y utilizar nuestro sitio web, usted acepta cumplir con los siguientes términos y condiciones.</p>

<h3>1. Generalidades</h3>
<p>Doña Yoli es un comercio electrónico que ofrece productos de cafetería, pizzería y despensa. Los presentes términos regulan el uso del sitio web y la compra de productos.</p>

<h3>2. Cuentas de Usuario</h3>
<p>Para realizar compras, debe crear una cuenta proporcionando información veraz y completa. Es responsable de mantener la confidencialidad de su contraseña.</p>

<h3>3. Productos y Precios</h3>
<p>Los productos publicados en el sitio están sujetos a disponibilidad. Los precios pueden variar y están expresados en pesos colombianos (COP). Nos reservamos el derecho de modificar precios sin previo aviso.</p>

<h3>4. Pedidos y Pagos</h3>
<p>Al realizar un pedido, usted acepta pagar el total indicado. Aceptamos los métodos de pago especificados en el sitio. Los pedidos serán confirmados vía correo electrónico.</p>

<h3>5. Entrega</h3>
<p>Ofrecemos servicio de entrega a domicilio con un costo adicional de $100 COP. Los tiempos de entrega son estimados y pueden variar según la ubicación.</p>

<h3>6. Cancelaciones</h3>
<p>Puede cancelar un pedido siempre y cuando no haya sido preparado. Una vez iniciado el proceso de preparación, no se aceptan cancelaciones.</p>

<h3>7. Propiedad Intelectual</h3>
<p>Todo el contenido del sitio web es propiedad de Doña Yoli y está protegido por derechos de autor.</p>

<h3>8. Limitación de Responsabilidad</h3>
<p>Doña Yoli no será responsable por daños directos o indirectos derivados del uso del sitio o la imposibilidad de usarlo.</p>

<h3>9. Modificaciones</h3>
<p>Nos reservamos el derecho de modificar estos términos en cualquier momento. El uso continuo del sitio implica la aceptación de los términos modificados.</p>

<h3>10. Contacto</h3>
<p>Para consultas sobre estos términos, contactenos a contacto@dona-yoli.com</p>`,
        isActive: true
      },
      {
        type: 'privacy',
        title: 'Política de Privacidad',
        content: `<h2>Política de Privacidad</h2>
<p>En Doña Yoli respetamos su privacidad y nos comprometemos a proteger sus datos personales.</p>

<h3>1. Información Recopilada</h3>
<p>Recopilamos información que usted nos proporciona al crear una cuenta, realizar pedidos o comunicarse con nosotros, incluyendo: nombre, correo electrónico, teléfono y dirección de entrega.</p>

<h3>2. Uso de la Información</h3>
<p>Utilizamos su información para:</p>
<ul>
<li>Procesar sus pedidos y entregas</li>
<li>Mejorar nuestros servicios</li>
<li>Enviar comunicaciones sobre sus pedidos</li>
<li>Personalizar su experiencia de compra</li>
</ul>

<h3>3. Protección de Datos</h3>
<p>Implementamos medidas de seguridad técnicas y organizativas para proteger sus datos contra accesos no autorizados, pérdidas o modificaciones.</p>

<h3>4. Compartir Información</h3>
<p>No vendemos sus datos personales. Compartimos información con terceros únicamente para:</p>
<ul>
<li>Procesar pagos (pasarela de pago)</li>
<li>Entregar pedidos (servicios de mensajería)</li>
<li>Cumplir requisitos legales</li>
</ul>

<h3>5. Cookies</h3>
<p>Utilizamos cookies para mejorar la experiencia del usuario. Puede desactivar las cookies en su navegador, aunque esto puede afectar algunas funcionalidades del sitio.</p>

<h3>6. Derechos del Usuario</h3>
<p>Usted tiene derecho a:</p>
<ul>
<li>Acceder a sus datos personales</li>
<li>Rectificar información incorrecta</li>
<li>Solicitar la eliminación de sus datos</li>
<li>Oponerse al tratamiento de sus datos</li>
</ul>

<h3>7. Retención de Datos</h3>
<p>Conservamos sus datos mientras tenga una cuenta activa o según sea necesario para cumplir con nuestras obligaciones legales.</p>

<h3>8. Menores de Edad</h3>
<p>Nuestro sitio no está dirigido a menores de edad. No recopilamos intencionalmente información de menores.</p>

<h3>9. Cambios en la Política</h3>
<p>Esta política puede actualizarse periódicamente. Le notificaremos sobre cambios significativos.</p>

<h3>10. Contacto</h3>
<p>Para ejercer sus derechos o consultas sobre privacidad, contactenos a contacto@dona-yoli.com</p>`,
        isActive: true
      },
      {
        type: 'returns',
        title: 'Política de Devoluciones',
        content: `<h2>Política de Devoluciones y Reembolsos</h2>
<p>En Doña Yoli queremos que quede satisfecho con su compra. A continuación, detallamos nuestra política de devoluciones.</p>

<h3>1. Productos Alimenticios</h3>
<p>Por razones de higiene y seguridad alimentaria, no aceptamos devoluciones de productos alimenticios que hayan sido entregados en perfectas condiciones, salvo en casos de errores en el pedido o productos defectuosos.</p>

<h3>2. Casos Aceptados para Devolución</h3>
<ul>
<li>Producto incorrecto recibido</li>
<li>Producto en mal estado o vencido</li>
<li>Producto incompleto</li>
<li>Alergias no especificadas que causen reacción</li>
</ul>

<h3>3. Plazo para Reportar Problemas</h3>
<p>Debe reportar cualquier problema con su pedido dentro de las 24 horas siguientes a la recepción del mismo.</p>

<h3>4. Proceso de Reclamo</h3>
<ol>
<li>Contactenos inmediatamente vía telefónica o correo electrónico</li>
<li>Proporcione su número de pedido y descripción del problema</li>
<li>Adjunte fotos del producto si aplica</li>
<li>Espere nuestra confirmación para proceder</li>
</ol>

<h3>5. Reembolsos</h3>
<p>Los reembolsos se procesarán según el método de pago original:</p>
<ul>
<li>Tarjetas de crédito/débito: 5-10 días hábiles</li>
<li>Transferencias: 3-5 días hábiles</li>
<li>Efectivo: en tienda o cuenta bancaria</li>
</ul>

<h3>6. Productos con Descuento</h3>
<p>Los productos en promoción o descuento no son elegibles para reembolso, solo para cambio por producto del mismo valor o superior.</p>

<h3>7. Costos de Envío</h3>
<p>Si el error es nuestro (producto incorrecto o defectuoso), cubriremos el costo de recolección y reenvío. En otros casos, el cliente asume los costos.</p>

<h3>8. Satisfacción del Cliente</h3>
<p>Si no está satisfecho con su compra por cualquier otra razón, contáctenos y buscaremos una solución justa.</p>

<h3>9. Excepciones</h3>
<p>No aplicamos esta política en casos de:</p>
<ul>
<li>Cambio de opinión del cliente</li>
<li>Productos consumidos parcialmente</li>
<li>Manipulación incorrecta del producto</li>
<li>Productos fuera del plazo de reporte</li>
</ul>

<h3>10. Contacto para Reclamos</h3>
<p>Para iniciar un proceso de devolución, contactenos a contacto@dona-yoli.com o llame al +57 300 123 4567</p>`,
        isActive: true
      }
    ]);

    await Settings.insertMany(DEFAULT_SETTINGS);

    console.log('Database seeded successfully');
  }

  getDeliveryFee(): number {
    return DEFAULT_DELIVERY_FEE;
  }
}

export const db = new Database();
