/* Shared catalogue and gallery data. Image paths are relative to the site root. */
var PRODUCTS = [
  { id: 'float', img: 'assets/p-float.jpg', code: 'V-01', name: 'Vidrio float', cat: 'vidrios', sw: 'sw-float', unit: 'm2', desc: 'Visión clara, sin distorsión óptica. El vidrio base para ventanas y aberturas.', tags: ['Ventanas', 'A medida'] },
  { id: 'semiespejado', img: 'assets/p-semiespejado.jpg', code: 'V-02', name: 'Vidrio semi-espejado', cat: 'vidrios', sw: 'sw-reflectivo', unit: 'm2', desc: 'Con una capa metálica que refleja parte de la luz: da privacidad desde afuera y ayuda a controlar el calor del sol.', tags: ['Privacidad', 'Control solar'] },
  { id: 'fantasia', img: 'assets/p-fantasia.jpg', code: 'V-03', name: 'Vidrio fantasía', cat: 'vidrios', sw: 'sw-fantasia', unit: 'm2', desc: 'Impreso con textura: difunde la luz y da privacidad.', tags: ['Decorativo', 'Privacidad'] },
  { id: 'armado', img: 'assets/p-armado.jpg', code: 'V-04', name: 'Vidrio armado', cat: 'seguridad', sw: 'sw-armado', unit: 'm2', desc: 'Translúcido, con malla de alambre de acero que retarda el paso del fuego.', tags: ['Seguridad', 'Fuego'] },
  { id: 'dvh', img: 'assets/p-dvh.jpg', code: 'V-05', name: 'DVH', cat: 'vidrios', sw: 'sw-dvh', unit: 'm2', desc: 'Doble Vidriado Hermético: cámara sellada que mejora la aislación térmica y acústica.', tags: ['Aislación', 'Ahorro'] },
  { id: 'templado', code: 'S-01', name: 'Vidrio templado', cat: 'seguridad', img: 'assets/bfcf306f.jpg', onOrder: true, unit: 'm2', desc: 'Templado por calor: de 4 a 5 veces más resistente que el vidrio común. Lo fabricamos solo a pedido, según tus medidas.', tags: ['Seguridad', 'A pedido'] },
  { id: 'laminado', img: 'assets/p-laminado.jpg', code: 'S-02', name: 'Vidrio laminado', cat: 'seguridad', sw: 'sw-laminado', unit: 'm2', desc: 'Con lámina de PVB o EVA que mantiene el vidrio unido ante un impacto.', tags: ['Seguridad', 'PVB · EVA'] },
  { id: 'espejos', code: 'E-01', name: 'Espejos', cat: 'deco', img: 'assets/9416057b.jpg', unit: 'm2', desc: 'Espejo de vidrio float con capa de plata y pintura protectora en la cara posterior. A medida para baños, placares, recibidores y gimnasios.', tags: ['Espejos', 'A medida'] },
  { id: 'mampara', code: 'B-01', name: 'Mamparas de baño', cat: 'bano', img: 'assets/aa3e352c.jpg', unit: 'u', desc: 'Mamparas laminadas para baño, a medida y estándar.', tags: ['Baño', 'A medida'] },
  { id: 'auto', img: 'assets/p-auto.jpg', code: 'AU-01', name: 'Vidrios para autos', cat: 'automotor', sw: 'sw-auto', unit: 'u', desc: 'Parabrisas y vidrios para vehículos: provisión y cambio.', tags: ['Automotor', 'Colocación'] },
  { id: 'aberturas', code: 'AB-01', name: 'Aberturas de aluminio', cat: 'aberturas', img: 'assets/828a4140.jpg', unit: 'u', desc: 'Ventanas y puertas de aluminio línea Modena · Herrero.', tags: ['Aluminio'] },
  { id: 'alveolar', img: 'assets/p-alveolar.jpg', code: 'P-01', name: 'Policarbonato alveolar', cat: 'plasticos', sw: 'sw-policarbonato', unit: 'm2', desc: 'Placa liviana con cámaras de aire internas: deja pasar la luz natural y aísla del calor. Para techos, pérgolas y cerramientos.', tags: ['Techos', 'Liviano'] },
  { id: 'compacto', img: 'assets/p-compacto.jpg', code: 'P-02', name: 'Policarbonato compacto', cat: 'plasticos', sw: 'sw-compacto', unit: 'm2', desc: 'Placa maciza y lisa, transparente como el vidrio pero mucho más resistente a los golpes. Para marquesinas, mamparas protectoras y cerramientos de seguridad.', tags: ['Alta resistencia'] },
  { id: 'ladrillo', img: 'assets/p-ladrillo.jpg', code: 'D-01', name: 'Ladrillos de vidrio', cat: 'deco', sw: 'sw-ladrillo', unit: 'u', desc: 'Bloques de vidrio para muros que dejan pasar la luz.', tags: ['Construcción'] },
  { id: 'mueble', code: 'D-02', name: 'Muebles de vidrio', cat: 'deco', img: 'assets/86e089c3.jpg', unit: 'u', desc: 'Mesas, estantes, tapas y vitrinas de vidrio.', tags: ['Hogar'] }
];
var FILTERS = [
  { id: 'todos', label: 'Todos' },
  { id: 'vidrios', label: 'Vidrios' },
  { id: 'seguridad', label: 'Seguridad' },
  { id: 'bano', label: 'Baño' },
  { id: 'deco', label: 'Espejos y deco' },
  { id: 'aberturas', label: 'Aberturas' },
  { id: 'automotor', label: 'Automotor' },
  { id: 'plasticos', label: 'Policarbonatos' }
];
var CAT_LABEL = { vidrios: 'VIDRIOS', seguridad: 'SEGURIDAD', bano: 'BAÑO', deco: 'DECO', aberturas: 'ABERTURAS', automotor: 'AUTOMOTOR', plasticos: 'POLICARBONATO' };
var GALLERY = [
  { src: 'assets/a5bde224.jpg', cat: 'espejos', cap: 'Espejos con formas en baño de diseño' },
  { src: 'assets/video-cerramientos.mp4', cat: 'cerramientos', cap: 'Cerramientos y puertas de vidrio', video: true },
  { src: 'assets/bdada3fb.jpg', cat: 'banos', cap: 'Mampara con herrajes negros' },
  { src: 'assets/p-fantasia.jpg', cat: 'frentes', cap: 'Ventanales con vidrio fantasía de color' },
  { src: 'assets/p-alveolar.jpg', cat: 'banos', cap: 'Mampara de policarbonato alveolar a medida' },
  { src: 'assets/288fa911.jpg', cat: 'cerramientos', cap: 'Claraboya de vidrio con estructura metálica' },
  { src: 'assets/cc858084.jpg', cat: 'frentes', cap: 'Fachada comercial con cerramientos de vidrio' },
  { src: 'assets/71a3597e.jpg', cat: 'banos', cap: 'Espejo orgánico y mampara en baño' },
  { src: 'assets/e38ff9b6.jpg', cat: 'cerramientos', cap: 'Cerco de pileta en vidrio' },
  { src: 'assets/video-espejos.mp4', cat: 'espejos', cap: 'Espejos para gimnasio', video: true },
  { src: 'assets/bfcf306f.jpg', cat: 'cerramientos', cap: 'Cerramiento interior de vidrio' },
  { src: 'assets/2d325095.jpg', cat: 'frentes', cap: 'Puerta vidriada en aluminio negro' },
  { src: 'assets/e4885220.jpg', cat: 'frentes', cap: 'Vidrieras en local comercial' },
  { src: 'assets/aa3e352c.jpg', cat: 'banos', cap: 'Mampara de baño en aluminio blanco' },
  { src: 'assets/9416057b.jpg', cat: 'espejos', cap: 'Espejos a medida en local gastronómico' },
  { src: 'assets/86e089c3.jpg', cat: 'espejos', cap: 'Vitrina con puertas de vidrio' }
];
var GAL_FILTERS = [
  { id: 'todos', label: 'Todos' },
  { id: 'banos', label: 'Baños' },
  { id: 'espejos', label: 'Espejos y muebles' },
  { id: 'cerramientos', label: 'Cerramientos' },
  { id: 'frentes', label: 'Frentes y aberturas' }
];
var WA = 'https://wa.me/5492657525026';

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
function pad(n) { return (n < 10 ? '0' : '') + n; }
