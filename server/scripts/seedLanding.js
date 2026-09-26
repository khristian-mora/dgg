const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const initialData = {
    carousel: [
        {
            title: "Gestión y Asesorías Especializadas",
            subtitle: "ARMAS DE FUEGO DE DEFENSA PERSONAL",
            description: "Expertos en trámites ante el DCCAE e INDUMIL. Seguridad jurídica, eficiencia operativa y reserva absoluta para ciudadanos y empresas.",
            cta: "INICIAR MI TRÁMITE",
            image: "https://www.indumil.gov.co/wp-content/uploads/2024/02/Fusil_Galil_Ace_21_01.png"
        },
        {
            title: "Pistola Córdova Compacta",
            subtitle: "Diseño colombiano de vanguardia",
            description: "La Pistola Córdova ha sido diseñada y fabricada en Colombia para satisfacer las demandas de uso oficial y defensa personal.",
            cta: "VER SERVICIOS",
            image: "https://www.indumil.gov.co/wp-content/uploads/2024/02/compacta.jpg"
        },
        {
            title: "Indumil Ultra Martial .38",
            subtitle: "Defensa personal de alto nivel",
            description: "Este tipo de arma es muy valorada por su simplicidad de uso y su resistencia. Fabricada bajo estándares militares.",
            cta: "CONOCER MÁS",
            image: "https://www.indumil.gov.co/wp-content/uploads/2024/02/Revolver_Indumil_Martial_03.png"
        }
    ],
    images: {
        logo: '/dgg_logo.jpg',
        securityBg: '/security_monitoring_city_night_1773868641447.png',
        teamPhoto: '/quienes_somos_team_1773866667700.png'
    },
    stats: {
        main: [
            { value: "12k+", label: "Trámites Exitosos" },
            { value: "99%", label: "Legalidad Total" },
            { value: "20+", label: "Años de Experiencia" }
        ],
        security: {
            growth: "+120%",
            monthly: "92k+"
        }
    }
  };

  try {
    await prisma.configuracion.upsert({
      where: { clave: 'LANDING_PAGE_DATA' },
      update: { valor: JSON.stringify(initialData) },
      create: {
        clave: 'LANDING_PAGE_DATA',
        valor: JSON.stringify(initialData),
        descripcion: 'Configuración de la landing page (v2)'
      }
    });

    console.log('✅ Configuración de Landing Page (v2) inicializada con éxito');
  } catch (err) {
    console.error('❌ Error al inicializar configuración:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
