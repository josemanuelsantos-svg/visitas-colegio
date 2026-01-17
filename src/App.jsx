import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithCustomToken,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  Download,
  Trash2,
  Search,
  School,
  ChevronRight,
  User,
  Mail,
  Phone,
  Baby,
  Lock,
  Unlock,
  MapPin,
  Globe,
  BookOpen,
  Info,
  MessageCircle,
  Star,
  ChevronDown,
  ChevronUp,
  Award,
  Waves,
  Utensils,
  Leaf,
  Cpu,
  Mic,
  Brain,
  Languages,
  FlaskConical,
  Gamepad2,
  Puzzle,
  Sparkles,
  Move,
  Plane,
  GraduationCap,
  Instagram,
  Music,
  Glasses,
  Printer,
  CalendarPlus,
  Coffee,
  Presentation,
  Dumbbell,
  FileText,
  Timer,
  AlertCircle,
  MonitorPlay,
  Library,
  Map as MapIcon,
  Footprints,
  ExternalLink,
  Sun,
  ArrowRight,
  XCircle,
  Ban,
  Settings,
  ToggleLeft,
  ToggleRight,
  Share2,
  Navigation,
  Copy,
  PlusCircle,
  RefreshCw,
} from 'lucide-react';

// --- Configuración de Firebase ---
const getFirebaseConfig = () => {
  if (typeof __firebase_config !== 'undefined') {
    return JSON.parse(__firebase_config);
  }
  return {
    apiKey: 'AIzaSyAeiZxdEoAhjCxk2jhVOKc_A7Ag7a455QM',
    authDomain: 'inscripciones-jpa.firebaseapp.com',
    projectId: 'inscripciones-jpa',
    storageBucket: 'inscripciones-jpa.firebasestorage.app',
    messagingSenderId: '929100613235',
    appId: '1:929100613235:web:6677b72ffe6d74efa5cc06',
  };
};

const firebaseConfig = getFirebaseConfig();
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const appId =
  typeof __app_id !== 'undefined' ? __app_id : 'inscripciones-web-publica';

// --- Configuración de la App ---
const COLLECTION_NAME = 'open_house_registrations_v2_sanbuenaventura';
const CONFIG_COLLECTION_NAME = 'open_house_slots_config_v1';
const SLOTS_COLLECTION_NAME = 'open_house_slots_data_v1';
const ADMIN_PASSWORD = 'Itinerarium@1274';
const DEFAULT_CONTACT_EMAIL = 'infantil@sanbuenaventura.org';
const INSTAGRAM_URL = 'https://www.instagram.com/cs_buenaventura/?hl=es';
const LOGO_URL = 'https://i.ibb.co/FLS9ybLj/cropped-Colegio-1.png';
const MICOLE_URL =
  'https://www.micole.net/madrid/madrid/colegio-san-buenaventura';

// Fechas INICIALES (FIJAS - EI/EP)
const DEFAULT_EI_EP_SLOTS = [
  {
    id: 'def_1',
    date: '2026-02-17',
    label: 'Martes 17 de Febrero',
    times: ['14:20'],
    group: 'EI_EP',
  },
  {
    id: 'def_2',
    date: '2026-02-20',
    label: 'Viernes 20 de Febrero',
    times: ['09:10'],
    group: 'EI_EP',
  },
  {
    id: 'def_3',
    date: '2026-02-25',
    label: 'Miércoles 25 de Febrero',
    times: ['09:10'],
    group: 'EI_EP',
  },
  {
    id: 'def_4',
    date: '2026-02-27',
    label: 'Viernes 27 de Febrero',
    times: ['14:20'],
    group: 'EI_EP',
  },
  {
    id: 'def_5',
    date: '2026-03-02',
    label: 'Lunes 02 de Marzo',
    times: ['14:20'],
    group: 'EI_EP',
  },
  {
    id: 'def_6',
    date: '2026-03-11',
    label: 'Miércoles 11 de Marzo',
    times: ['09:10'],
    group: 'EI_EP',
  },
];

// Imágenes de Instalaciones
const FACILITIES_IMAGES = [
  {
    id: 1,
    title: 'Iglesia',
    img: 'https://i.ibb.co/N6DvggGM/20251213-Instalaciones-colegio-San-Buenaventura-0029.jpg',
    icon: Sparkles,
    cols: 'md:col-span-2',
  },
  {
    id: 9,
    title: 'Lab. STEAM',
    img: 'https://i.ibb.co/nqLPjHjg/1706700906038.jpg',
    icon: Cpu,
    cols: 'md:col-span-1',
  },
  {
    id: 8,
    title: 'Piscina',
    img: 'https://i.ibb.co/prLwgXph/20251220-Instalaciones-colegio-San-Buenaventura-0272.jpg',
    icon: Waves,
    cols: 'md:col-span-1',
  },
  {
    id: 2,
    title: 'Radio',
    img: 'https://i.ibb.co/8DpRPHzY/20251213-Instalaciones-colegio-San-Buenaventura-0108.jpg',
    icon: Mic,
    cols: 'md:col-span-1',
  },
  {
    id: 3,
    title: 'Ciencias',
    img: 'https://i.ibb.co/5ggD6m1t/20251213-Instalaciones-colegio-San-Buenaventura-0166.jpg',
    icon: FlaskConical,
    cols: 'md:col-span-1',
  },
  {
    id: 5,
    title: 'Psicomotricidad',
    img: 'https://i.ibb.co/TD04CVFL/20251213-Instalaciones-colegio-San-Buenaventura-0213.jpg',
    icon: Move,
    cols: 'md:col-span-2',
  },
  {
    id: 6,
    title: 'Infantil',
    img: 'https://i.ibb.co/bjm0FN1p/20251213-Instalaciones-colegio-San-Buenaventura-0217.jpg',
    icon: Baby,
    cols: 'md:col-span-1',
  },
  {
    id: 4,
    title: 'Comedor',
    img: 'https://i.ibb.co/kgcdMsrw/20251213-Instalaciones-colegio-San-Buenaventura-0194.jpg',
    icon: Utensils,
    cols: 'md:col-span-1',
  },
  {
    id: 7,
    title: 'Patio',
    img: 'https://i.ibb.co/N6pfsHw0/20251213-Instalaciones-colegio-San-Buenaventura-0228.jpg',
    icon: Sun,
    cols: 'md:col-span-2',
  },
];

// Datos de Proyectos
const PROJECTS_DATA = [
  {
    title: 'Natación',
    icon: Waves,
    color: 'text-indigo-600 bg-indigo-50',
    border: 'border-indigo-500',
    desc: 'Integrada en horario lectivo.',
  },
  {
    title: 'Psicomotricidad',
    icon: Move,
    color: 'text-pink-600 bg-pink-50',
    border: 'border-pink-300',
    desc: 'Desarrollo integral del niño.',
  },
  {
    title: 'Identidad',
    icon: Sparkles,
    color: 'text-yellow-600 bg-yellow-50',
    border: 'border-yellow-300',
    desc: 'Valores franciscanos.',
  },
  {
    title: 'Cocina Propia',
    icon: Utensils,
    color: 'text-emerald-600 bg-emerald-50',
    border: 'border-emerald-300',
    desc: 'Menús saludables diarios.',
  },
  {
    title: 'Orientación',
    icon: Glasses,
    color: 'text-teal-600 bg-teal-50',
    border: 'border-teal-300',
    desc: 'Acompañamiento personalizado.',
  },
  {
    title: 'STEAM Labs',
    icon: FlaskConical,
    color: 'text-blue-600 bg-blue-50',
    border: 'border-blue-300',
    desc: 'Experimentación real.',
  },
  {
    title: 'Radio',
    icon: Mic,
    color: 'text-red-600 bg-red-50',
    border: 'border-red-300',
    desc: 'Mejora de la oratoria.',
  },
  {
    title: 'Ajedrez',
    icon: Brain,
    color: 'text-amber-600 bg-amber-50',
    border: 'border-amber-300',
    desc: 'Pensamiento estratégico.',
  },
  {
    title: 'Música',
    icon: Music,
    color: 'text-violet-600 bg-violet-50',
    border: 'border-violet-300',
    desc: 'Sensibilidad artística.',
  },
  {
    title: 'Plan Lector',
    icon: BookOpen,
    color: 'text-orange-600 bg-orange-50',
    border: 'border-orange-300',
    desc: 'Animación a la lectura.',
  },
];

const GRADES_EI_EP = [
  'Infantil 3 años',
  'Infantil 4 años',
  'Infantil 5 años',
  '1º Primaria',
  '2º Primaria',
  '3º Primaria',
  '4º Primaria',
  '5º Primaria',
  '6º Primaria',
];
const GRADES_ESO_BTO = [
  '1º ESO',
  '2º ESO',
  '3º ESO',
  '4º ESO',
  '1º Bachillerato',
  '2º Bachillerato',
];
const GRADES = [...GRADES_EI_EP, ...GRADES_ESO_BTO];

const STAGE_CONTACTS = [
  {
    stage: 'Infantil',
    name: 'Elena Díaz',
    role: 'Coordinadora',
    email: 'coordinacion.infantil@sanbuenaventura.org',
    Icon: Baby,
    color: 'text-emerald-600 bg-emerald-50',
  },
  {
    stage: 'Primaria',
    name: 'José Manuel Santos',
    role: 'Director Pedagógico',
    email: 'primaria@sanbuenaventura.org',
    Icon: BookOpen,
    color: 'text-blue-600 bg-blue-50',
  },
  {
    stage: 'Secundaria',
    name: 'Luis F. Redruello',
    role: 'Director Pedagógico',
    email: 'secundaria@sanbuenaventura.org',
    Icon: School,
    color: 'text-indigo-600 bg-indigo-50',
  },
  {
    stage: 'Bachillerato',
    name: 'Philippe Saint-Nard',
    role: 'Coordinador',
    email: 'coordinacion.bachillerato@sanbuenaventura.org',
    Icon: GraduationCap,
    color: 'text-violet-600 bg-violet-50',
  },
];

const TOUR_STOPS = [
  { name: 'Piscina', icon: Waves, color: 'bg-blue-100 text-blue-600' },
  { name: 'Infantil', icon: Baby, color: 'bg-pink-100 text-pink-600' },
  { name: 'Comedor', icon: Utensils, color: 'bg-emerald-100 text-emerald-600' },
  {
    name: 'Psicomotricidad',
    icon: Move,
    color: 'bg-orange-100 text-orange-600',
  },
  { name: 'STEAM', icon: Cpu, color: 'bg-indigo-100 text-indigo-600' },
  { name: 'Radio', icon: Mic, color: 'bg-red-100 text-red-600' },
  { name: 'Pastoral', icon: Sparkles, color: 'bg-yellow-100 text-yellow-600' },
];

const HIGH_DEMAND_THRESHOLD = 6;
const MAX_CAPACITY = 15;

const CountdownTimer = ({ targetDate }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    if (difference > 0) {
      return {
        días: Math.floor(difference / (1000 * 60 * 60 * 24)),
        horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
        min: Math.floor((difference / 1000 / 60) % 60),
        seg: Math.floor((difference / 1000) % 60),
      };
    }
    return null;
  };
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft)
    return (
      <div className="inline-flex items-center gap-2 py-2 px-6 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 shadow-sm animate-pulse mb-8">
        ¡El periodo de admisión ha comenzado!
      </div>
    );

  return (
    <div className="flex flex-col items-center mb-10">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
        Tiempo para el inicio de admisión
      </p>
      <div className="flex gap-3 justify-center animate-fade-in">
        {Object.keys(timeLeft).map((interval) => (
          <div
            key={interval}
            className="flex flex-col items-center bg-white/30 backdrop-blur-md rounded-lg p-2 min-w-[65px] border border-white/40 shadow-lg"
          >
            <span className="text-xl md:text-2xl font-extrabold text-slate-800 drop-shadow-sm">
              {timeLeft[interval]}
            </span>
            <span className="text-[10px] uppercase text-slate-600 font-bold tracking-widest">
              {interval}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('landing');
  const [registrations, setRegistrations] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [slotStatus, setSlotStatus] = useState({});
  const [openFaq, setOpenFaq] = useState(null);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    parentName: '',
    email: '',
    phone: '',
    childName: '',
    childAge: '',
    currentSchool: '',
    interestedGrade: '',
    selectedDate: '',
    selectedTime: '',
    attendeesCount: 1,
    acceptPrivacy: false,
  });
  const [adminPassInput, setAdminPassInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [newSlotDate, setNewSlotDate] = useState('');
  const [newSlotTime, setNewSlotTime] = useState('');
  const [newSlotLabel, setNewSlotLabel] = useState('');
  const [newSlotGroup, setNewSlotGroup] = useState('EI_EP');

  const slotOccupancy = useMemo(() => {
    const counts = {};
    registrations.forEach((reg) => {
      const key = `${reg.selectedDate}_${reg.selectedTime}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [registrations]);

  const displaySlots = useMemo(() => {
    const combined = [...DEFAULT_EI_EP_SLOTS, ...availableSlots];
    return combined.sort((a, b) => {
      const dateA = a.date;
      const dateB = b.date;
      if (dateA < dateB) return -1;
      if (dateA > dateB) return 1;
      return a.times[0].localeCompare(b.times[0]);
    });
  }, [availableSlots]);

  const slotsEI_EP = displaySlots.filter((s) => s.group === 'EI_EP');
  const slotsESO_BTO = displaySlots.filter((s) => s.group === 'ESO_BTO');

  let relevantSlots = [];
  if (formData.interestedGrade) {
    if (GRADES_ESO_BTO.includes(formData.interestedGrade))
      relevantSlots = slotsESO_BTO;
    else if (GRADES_EI_EP.includes(formData.interestedGrade))
      relevantSlots = slotsEI_EP;
  }

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scroll = `${totalScroll / windowHeight}`;
      setScrollProgress(Number(scroll));
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (
          typeof __initial_auth_token !== 'undefined' &&
          __initial_auth_token
        ) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error('Auth error:', error);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubReg = onSnapshot(
      query(
        collection(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME)
      ),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }));

        // Ordenar: Primero por índice del curso (GRADES), luego por fecha de creación
        data.sort((a, b) => {
          const indexA = GRADES.indexOf(a.interestedGrade);
          const indexB = GRADES.indexOf(b.interestedGrade);

          if (indexA !== -1 && indexB !== -1) {
            // Si ambos cursos existen en la lista, ordenar por su posición
            return indexA - indexB;
          }

          // Si alguno no tiene curso o no está en la lista (raro), fallback a fecha
          return b.createdAt - a.createdAt;
        });

        setRegistrations(data);
        setLoading(false);
      }
    );
    const unsubConfig = onSnapshot(
      query(
        collection(
          db,
          'artifacts',
          appId,
          'public',
          'data',
          CONFIG_COLLECTION_NAME
        )
      ),
      (snap) => {
        const config = {};
        snap.docs.forEach((d) => (config[d.id] = d.data().isOpen));
        setSlotStatus(config);
      }
    );
    const unsubSlots = onSnapshot(
      query(
        collection(
          db,
          'artifacts',
          appId,
          'public',
          'data',
          SLOTS_COLLECTION_NAME
        ),
        orderBy('date')
      ),
      (snap) => {
        setAvailableSlots(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    );
    return () => {
      unsubReg();
      unsubConfig();
      unsubSlots();
    };
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (name === 'interestedGrade')
      setFormData((prev) => ({ ...prev, selectedDate: '', selectedTime: '' }));
    if (formError) setFormError('');
  };

  const handleSlotSelect = (date, time) => {
    setFormData((prev) => ({
      ...prev,
      selectedDate: date,
      selectedTime: time,
    }));
    if (formError) setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    // Validación estricta de todos los campos obligatorios
    if (
      !formData.parentName ||
      !formData.email ||
      !formData.phone ||
      !formData.childName ||
      !formData.childAge
    ) {
      setFormError(
        'Por favor, completa todos los datos obligatorios (Datos de familia y alumno).'
      );
      return;
    }

    if (!formData.interestedGrade) {
      setFormError('Por favor, selecciona el curso de interés.');
      return;
    }
    if (!formData.selectedDate) {
      setFormError('Por favor, selecciona una fecha y hora para la visita.');
      return;
    }
    if (!formData.acceptPrivacy) {
      setFormError('Debes aceptar la política de privacidad para continuar.');
      return;
    }
    setLoading(true);
    try {
      await addDoc(
        collection(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME),
        { ...formData, createdAt: Timestamp.now(), status: 'confirmed' }
      );
      await new Promise((resolve) => setTimeout(resolve, 600));
      setView('success');
      setLoading(false);
    } catch (error) {
      setFormError('Error al guardar.');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(
        doc(db, 'artifacts', appId, 'public', 'data', COLLECTION_NAME, id)
      );
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };
  const toggleSlotStatus = async (slotId, currentStatus) => {
    const newStatus = currentStatus === undefined ? false : !currentStatus;
    await setDoc(
      doc(
        db,
        'artifacts',
        appId,
        'public',
        'data',
        CONFIG_COLLECTION_NAME,
        slotId
      ),
      { isOpen: newStatus }
    );
  };
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPassInput === ADMIN_PASSWORD) {
      setView('admin');
      setAdminPassInput('');
    } else {
      alert('Contraseña incorrecta');
    }
  };
  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!newSlotDate) return;
    await addDoc(
      collection(
        db,
        'artifacts',
        appId,
        'public',
        'data',
        SLOTS_COLLECTION_NAME
      ),
      {
        date: newSlotDate,
        times: [newSlotTime],
        label: newSlotLabel,
        group: newSlotGroup,
      }
    );
    setNewSlotDate('');
    alert('Fecha añadida');
  };
  const handleDeleteSlot = async (id) => {
    await deleteDoc(
      doc(db, 'artifacts', appId, 'public', 'data', SLOTS_COLLECTION_NAME, id)
    );
  };
  const loadDefaultSlots = async () => {
    if (window.confirm('Cargar defaults?')) {
      const clean = DEFAULT_EI_EP_SLOTS.map(({ id, ...rest }) => rest);
      for (const s of clean)
        await addDoc(
          collection(
            db,
            'artifacts',
            appId,
            'public',
            'data',
            SLOTS_COLLECTION_NAME
          ),
          s
        );
    }
  };
  const toggleFaq = (index) => setOpenFaq(openFaq === index ? null : index);

  // FUNCIONALIDAD REAL DE EXPORTACIÓN A EXCEL/CSV
  const exportToCSV = () => {
    if (registrations.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }

    // Definir cabeceras compatibles con Excel
    const headers = [
      'Fecha Visita',
      'Hora Visita',
      'Curso Interés',
      'Nombre Padre/Madre',
      'Email',
      'Teléfono',
      'Nombre Alumno',
      'Año Nacimiento',
      'Asistentes',
      'Fecha Registro',
    ];

    // Convertir datos a filas CSV
    const csvContent = [
      headers.join(','),
      ...registrations.map((reg) => {
        const row = [
          reg.selectedDate,
          reg.selectedTime,
          reg.interestedGrade,
          reg.parentName,
          reg.email,
          reg.phone,
          reg.childName,
          reg.childAge,
          reg.attendeesCount,
          reg.createdAt ? new Date(reg.createdAt).toLocaleString() : '',
        ];
        // Escapar comillas y envolver en comillas para manejar comas en los datos
        return row
          .map((field) => `"${String(field || '').replace(/"/g, '""')}"`)
          .join(',');
      }),
    ].join('\n');

    // Crear Blob con BOM para que Excel reconozca caracteres especiales (tildes, ñ)
    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `inscripciones_open_house_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addToGoogleCalendar = () => {
    const { selectedDate, selectedTime, childName } = formData;
    const text = encodeURIComponent(
      `Visita Colegio San Buenaventura - ${childName}`
    );
    const details = encodeURIComponent(
      `Visita de puertas abiertas para ${childName}.`
    );
    const location = encodeURIComponent('Calle de El Greco 16, 28011 Madrid');

    // Construcción simple de URL para Google Calendar
    // NOTA: Para una implementación precisa se requiere parsear selectedDate (YYYY-MM-DD) y Time
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}&location=${location}`;
    window.open(url, '_blank');
  };

  const filteredRegistrations = useMemo(() => {
    return registrations.filter(
      (r) =>
        r.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.childName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [registrations, searchTerm]);

  if (!user && loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-indigo-800 text-lg font-medium">
        Cargando...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-indigo-100 selection:text-indigo-800">
      {/* Botón Flotante */}
      {view === 'landing' && (
        <div className="fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-slate-200 p-3 md:bg-transparent md:border-none md:p-0 md:bottom-8 md:right-8 md:left-auto md:w-auto">
          <button
            type="button"
            onClick={() => setView('form')}
            className="w-full md:w-auto group bg-gradient-to-r from-indigo-700 to-blue-600 text-white py-4 md:px-7 rounded-xl md:rounded-full font-bold shadow-lg md:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:scale-105 hover:shadow-[0_8px_35px_rgb(0,0,0,0.3)] transition-all duration-300 flex items-center justify-center gap-3 border-[3px] border-white/20 backdrop-blur-sm md:animate-bounce-slow"
            style={{ animationDelay: '0.5s' }}
          >
            <Calendar size={22} className="group-hover:animate-pulse" />
            <span className="text-lg tracking-wide">Reservar Visita</span>
          </button>
        </div>
      )}

      {/* Header Info Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white px-4 py-3 text-center text-sm font-bold shadow-md relative z-50 flex justify-center items-center gap-2 tracking-wide">
        <Info size={18} className="text-white/90" />
        <span className="drop-shadow-sm">
          Plazo Oficial de Admisión 25-26:{' '}
          <span className="bg-white/20 px-2 py-0.5 rounded-md ml-1">
            Del 11 al 25 de Marzo
          </span>
        </span>
      </div>

      {/* Navigation */}
      <header
        className={`sticky top-0 left-0 w-full z-40 transition-all duration-500 ease-in-out ${
          scrolled
            ? 'bg-white/90 backdrop-blur-xl shadow-lg py-3 border-b border-indigo-100/50'
            : 'bg-white/40 backdrop-blur-sm py-5 border-b border-transparent'
        }`}
      >
        <div className="absolute top-0 left-0 h-[3px] bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-150 z-50"></div>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div
            className="flex items-center gap-4 cursor-pointer group"
            onClick={() => setView('landing')}
          >
            <img
              src={LOGO_URL}
              alt="Logo Colegio"
              className={`transition-all duration-500 ${
                scrolled ? 'h-10 w-auto' : 'h-14 w-auto'
              } drop-shadow-sm`}
            />
            <div>
              <h1
                className={`font-bold text-slate-900 leading-none tracking-tight group-hover:text-indigo-800 transition-colors duration-300 ${
                  scrolled ? 'text-lg' : 'text-xl md:text-2xl'
                }`}
              >
                Colegio San Buenaventura
              </h1>
              <p className="text-[10px] md:text-xs text-indigo-700 font-bold uppercase tracking-[0.2em] mt-1 opacity-80">
                Orden de los Franciscanos Menores Conventuales
              </p>
            </div>
          </div>
          {view !== 'admin' && view !== 'adminLogin' && (
            <button
              type="button"
              onClick={() => setView('adminLogin')}
              className={`text-xs font-bold transition-all duration-300 uppercase tracking-widest px-5 py-2 rounded-full border ${
                scrolled
                  ? 'text-indigo-700 bg-indigo-50 border-indigo-100 hover:bg-indigo-100'
                  : 'text-slate-700 bg-white/80 border-slate-200 hover:border-indigo-400 hover:text-indigo-700 shadow-sm'
              }`}
            >
              Acceso Centro
            </button>
          )}
          {view === 'admin' && (
            <button
              type="button"
              onClick={() => setView('landing')}
              className="text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-5 py-2 rounded-full border border-indigo-100 transition-colors"
            >
              Ver Web Pública
            </button>
          )}
        </div>
      </header>

      {/* VISTAS */}
      {view === 'landing' && (
        <>
          {/* Hero Section */}
          <main className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32">
            <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-200/30 rounded-full blur-[100px] animate-pulse"></div>
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] bg-blue-200/20 rounded-full blur-[120px]"></div>
            </div>
            <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
              <CountdownTimer targetDate="2026-03-11T09:00:00" />
              <div className="max-w-4xl mx-auto mb-10 bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white shadow-xl animate-fade-in-up">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-1 w-full">
                    <h3 className="text-left text-slate-900 font-bold text-lg mb-3 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-indigo-600" /> Próximas
                      Fechas (EI / EP)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-left">
                      {slotsEI_EP.length > 0 ? (
                        slotsEI_EP.map((slot) => (
                          <div
                            key={slot.id}
                            className="flex justify-between items-center text-sm border-b border-indigo-100 last:border-0 sm:last:border-b py-1"
                          >
                            <span className="text-slate-700">{slot.label}</span>
                            <span className="font-bold text-indigo-700">
                              {slot.times.join(', ')}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm italic text-slate-500">
                          Cargando fechas...
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="w-full md:w-auto border-t md:border-t-0 md:border-l border-indigo-100 pt-4 md:pt-0 md:pl-6 flex flex-col justify-start">
                    <h4 className="text-left text-slate-900 font-bold text-sm mb-2 flex items-center gap-2">
                      Secundaria y Bach.
                    </h4>
                    {slotsESO_BTO.length > 0 ? (
                      <div className="space-y-1">
                        {slotsESO_BTO.map((s) => (
                          <div key={s.id} className="text-xs text-slate-600">
                            {s.label} - <b>{s.times[0]}</b>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic bg-slate-100 p-2 rounded">
                        Próximamente nuevas fechas
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <h2 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-8 tracking-tight leading-[1.1]">
                Innovación, Valores y<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-blue-600 to-indigo-500 drop-shadow-sm">
                  Excelencia Educativa
                </span>
              </h2>
              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setView('form')}
                  className="group bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Reservar Mi Visita <ChevronRight size={20} />
                  </span>
                  <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-indigo-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </button>
              </div>
            </div>
          </main>

          {/* Agenda */}
          <div className="max-w-4xl mx-auto px-6 mb-24 mt-10">
            <div className="text-center mb-16">
              <h3 className="text-3xl font-extrabold text-slate-900">
                Agenda de la Jornada
              </h3>
            </div>
            <div className="relative">
              <div className="absolute left-[28px] md:left-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-indigo-100 via-indigo-200 to-indigo-100 md:-translate-x-1/2"></div>
              <div className="space-y-12">
                {[
                  {
                    time: "10'",
                    title: 'Bienvenida Institucional',
                    desc: 'Recepción por el equipo de titularidad.',
                    icon: <User size={20} />,
                    color: 'text-blue-600 bg-blue-50',
                  },
                  {
                    time: "50'",
                    title: 'Visita Guiada Integral',
                    desc: 'Recorrido detallado por nuestras instalaciones.',
                    icon: <MapIcon size={20} />,
                    color: 'text-emerald-600 bg-emerald-50',
                    details: TOUR_STOPS,
                  },
                  {
                    time: "10'",
                    title: 'Proceso de Admisión',
                    desc: 'Explicación breve de plazos.',
                    icon: <FileText size={20} />,
                    color: 'text-amber-600 bg-amber-50',
                  },
                  {
                    time: "20'",
                    title: 'Café y Dudas',
                    desc: 'Espacio distendido.',
                    icon: <Coffee size={20} />,
                    color: 'text-indigo-600 bg-indigo-50',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`relative flex items-start md:justify-between group ${
                      idx % 2 === 0 ? 'md:flex-row-reverse' : ''
                    }`}
                  >
                    <div className="hidden md:block md:w-[45%]"></div>
                    <div
                      className={`absolute left-0 md:left-1/2 -translate-x-[2px] md:-translate-x-1/2 w-14 h-14 border-4 border-white rounded-full flex items-center justify-center shadow-lg z-10 ${item.color}`}
                    >
                      {item.icon}
                    </div>
                    <div className="ml-20 md:ml-0 md:w-[45%] bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-indigo-100 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-lg text-slate-800">
                          {item.title}
                        </h4>
                        <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed mb-3">
                        {item.desc}
                      </p>
                      {item.details && (
                        <div className="mt-6 pt-4 border-t border-slate-50">
                          <div className="grid grid-cols-2 gap-3">
                            {item.details.map((stop, i) => {
                              const StopIcon = stop.icon;
                              return (
                                <div
                                  key={i}
                                  className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-100"
                                >
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${stop.color}`}
                                  >
                                    <StopIcon size={14} />
                                  </div>
                                  <span className="text-xs font-bold text-slate-600">
                                    {stop.name}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Metodología */}
          <div className="max-w-7xl mx-auto px-6 mb-24">
            <div className="bg-white/80 backdrop-blur-xl p-10 md:p-16 rounded-[2.5rem] shadow-xl border border-white relative overflow-hidden">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-extrabold text-slate-900 mb-3">
                  Vanguardia Metodológica
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {PROJECTS_DATA.slice(0, 4).map((item, i) => {
                  const PIcon = item.icon;
                  return (
                    <div key={i} className="text-center p-4 border rounded-2xl">
                      <div
                        className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 ${item.color}`}
                      >
                        <PIcon size={28} />
                      </div>
                      <h4 className="font-bold">{item.title}</h4>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Instalaciones */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                <h3 className="text-4xl font-extrabold text-slate-900 mb-4">
                  Espacios para crecer
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {FACILITIES_IMAGES.map((item) => {
                  const FacilityIcon = item.icon;
                  return (
                    <div
                      key={item.id}
                      className={`${item.cols} relative h-64 rounded-3xl overflow-hidden group shadow-lg cursor-pointer`}
                    >
                      <img
                        src={item.img}
                        alt={item.title}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 will-change-transform transform-gpu"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity duration-300"></div>
                      <div className="absolute bottom-0 left-0 p-6 z-20 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <h4 className="text-white text-xl font-bold flex items-center gap-2 mb-1">
                          <FacilityIcon size={20} className="text-white/90" />
                          {item.title}
                        </h4>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Testimonios */}
          <section className="bg-slate-900 text-white py-24 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-900/30 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="text-center mb-16">
                <h3 className="text-4xl font-extrabold mb-4">
                  Lo que dicen nuestras familias
                </h3>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
                <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                  <div className="flex text-amber-400 mb-4 space-x-1">
                    <Star fill="currentColor" size={18} />
                    <Star fill="currentColor" size={18} />
                    <Star fill="currentColor" size={18} />
                    <Star fill="currentColor" size={18} />
                    <Star fill="currentColor" size={18} />
                  </div>
                  <p className="text-slate-300 text-lg italic mb-6">
                    "Un colegio de referencia. Ambiente cercano y familiar."
                  </p>
                  <div className="font-bold">
                    P. P.{' '}
                    <span className="block text-sm font-normal text-slate-400">
                      Familia del Centro
                    </span>
                  </div>
                </div>
                <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                  <div className="flex text-amber-400 mb-4 space-x-1">
                    <Star fill="currentColor" size={18} />
                    <Star fill="currentColor" size={18} />
                    <Star fill="currentColor" size={18} />
                    <Star fill="currentColor" size={18} />
                    <Star fill="currentColor" size={18} />
                  </div>
                  <p className="text-slate-300 text-lg italic mb-6">
                    "Trato personal magnífico. Mi hija se siente motivada."
                  </p>
                  <div className="font-bold">
                    M. M.{' '}
                    <span className="block text-sm font-normal text-slate-400">
                      Madre de alumna
                    </span>
                  </div>
                </div>
                <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                  <div className="flex text-amber-400 mb-4 space-x-1">
                    <Star fill="currentColor" size={18} />
                    <Star fill="currentColor" size={18} />
                    <Star fill="currentColor" size={18} />
                    <Star fill="currentColor" size={18} />
                    <Star fill="currentColor" size={18} />
                  </div>
                  <p className="text-slate-300 text-lg italic mb-6">
                    "El colegio de mis nietas. Muy bueno, nos tratan muy bien y
                    estamos muy contentos."
                  </p>
                  <div className="font-bold">
                    N. G.{' '}
                    <span className="block text-sm font-normal text-slate-400">
                      Abuela de alumnas
                    </span>
                  </div>
                </div>
                <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                  <div className="flex text-amber-400 mb-4 space-x-1">
                    <Star fill="currentColor" size={18} />
                    <Star fill="currentColor" size={18} />
                    <Star fill="currentColor" size={18} />
                    <Star fill="currentColor" size={18} />
                    <Star fill="currentColor" size={18} />
                  </div>
                  <p className="text-slate-300 text-lg italic mb-6">
                    "El mejor colegio de la historia. Mi prima va y dice que le
                    encanta."
                  </p>
                  <div className="font-bold">
                    A. J. O.{' '}
                    <span className="block text-sm font-normal text-slate-400">
                      Familiar de alumna
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-12 text-center">
                <a
                  href={MICOLE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Ver todas las opiniones en Micole <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="max-w-4xl mx-auto my-24 px-6">
            <h3 className="text-3xl font-extrabold text-center mb-12 text-slate-900">
              Preguntas Frecuentes
            </h3>
            <div className="space-y-4">
              {[
                {
                  q: '¿Cuándo es el periodo oficial de admisión?',
                  a: 'El plazo oficial de presentación de solicitudes para el curso 2025-26 es del 11 al 25 de Marzo, ambos inclusive. Nosotros te ayudamos con todo el proceso.',
                },
                {
                  q: '¿La piscina tiene coste adicional?',
                  a: 'La natación está integrada dentro de la asignatura de Educación Física. Además, existe la opción de escuela de natación como actividad extraescolar, que sí tiene un coste asociado.',
                },
                {
                  q: '¿Tenéis cocina propia?',
                  a: 'Sí, contamos con cocina propia en las instalaciones. Nuestros menús se elaboran diariamente en el colegio con productos frescos y de calidad, atendiendo a todas las necesidades dietéticas y alergias.',
                },
                {
                  q: '¿Hay servicio de horario ampliado?',
                  a: "Sí, para facilitar la conciliación familiar disponemos de servicio de 'Madrugadores' con opción de desayuno, así como de actividades extraescolares por la tarde.",
                },
                {
                  q: '¿Cómo funciona el proyecto bilingüe?',
                  a: 'Desarrollamos un Proyecto Propio de Bilingüismo autorizado por la Comunidad de Madrid. Aumentamos las horas de exposición al inglés, contamos con auxiliares de conversación nativos y preparamos para exámenes oficiales de Cambridge.',
                },
                {
                  q: '¿Es obligatorio el uso de uniforme?',
                  a: 'Sí, el uso del uniforme escolar y la equipación deportiva del centro es obligatorio en las etapas de Educación Infantil, Primaria y Secundaria (ESO). En Bachillerato no es necesario.',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`border rounded-2xl transition-all duration-300 overflow-hidden ${
                    openFaq === idx
                      ? 'bg-indigo-50 border-indigo-200 shadow-md'
                      : 'bg-white border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className={`w-full flex justify-between items-center p-6 text-left font-bold transition-colors ${
                      openFaq === idx
                        ? 'text-indigo-800'
                        : 'text-slate-800 hover:text-indigo-800'
                    }`}
                    style={{ backgroundColor: 'white' }}
                  >
                    <span className="text-lg pr-4">{item.q}</span>
                    {openFaq === idx ? (
                      <ChevronUp
                        size={24}
                        className="text-indigo-600 shrink-0"
                      />
                    ) : (
                      <ChevronDown
                        size={24}
                        className="text-slate-400 shrink-0"
                      />
                    )}
                  </button>
                  <div
                    className={`bg-white transition-all duration-300 ease-in-out ${
                      openFaq === idx
                        ? 'max-h-96 opacity-100'
                        : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="p-6 pt-0 text-slate-600 leading-relaxed bg-white">
                      {item.a}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {view === 'form' && (
        <main className="max-w-3xl mx-auto px-4 py-12 relative z-10">
          <button
            onClick={() => setView('landing')}
            className="text-slate-500 hover:text-indigo-800 mb-8 flex items-center gap-2 text-sm font-medium transition-colors group"
          >
            <span className="bg-white p-2 rounded-full shadow-sm border border-slate-200 group-hover:border-indigo-300 transition-colors">
              <ChevronRight className="rotate-180" size={16} />
            </span>
            Volver al inicio
          </button>

          <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 overflow-hidden border border-white relative">
            <div className="h-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 relative z-10"></div>
            <div className="p-10 pb-0 relative z-10">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
                Reserva tu Visita
              </h2>
              <p className="text-slate-500">Completa el formulario.</p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-10 space-y-12 relative z-10"
            >
              <section className="bg-white/60 p-8 rounded-3xl border border-slate-200/60 shadow-sm backdrop-blur-sm">
                <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-3 mb-6">
                  <div className="bg-indigo-100 p-2 rounded-xl text-indigo-700 shadow-sm">
                    <User size={20} />
                  </div>
                  Datos de la Familia
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Nombre y Apellidos
                    </label>
                    <input
                      required
                      type="text"
                      name="parentName"
                      value={formData.parentName}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-slate-200 rounded-xl p-4 text-slate-900"
                      placeholder="Ej. María García"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Email
                    </label>
                    <input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-slate-200 rounded-xl p-4 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Teléfono
                    </label>
                    <input
                      required
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-slate-200 rounded-xl p-4 text-slate-900"
                    />
                  </div>
                </div>
              </section>

              <section className="bg-white/60 p-8 rounded-3xl border border-slate-200/60 shadow-sm backdrop-blur-sm">
                <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-3 mb-6">
                  <div className="bg-indigo-100 p-2 rounded-xl text-indigo-700 shadow-sm">
                    <Baby size={20} />
                  </div>
                  Datos del Alumno/a
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Nombre
                    </label>
                    <input
                      required
                      type="text"
                      name="childName"
                      value={formData.childName}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-slate-200 rounded-xl p-4 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Año Nacimiento
                    </label>
                    <input
                      required
                      type="number"
                      name="childAge"
                      value={formData.childAge}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-slate-200 rounded-xl p-4 text-slate-900"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Curso de Interés
                    </label>
                    <select
                      name="interestedGrade"
                      value={formData.interestedGrade}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-white border border-slate-200 rounded-xl p-4 text-slate-900"
                    >
                      <option value="">Selecciona curso...</option>
                      {GRADES.map((grade) => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-3 mb-6">
                  <div className="bg-indigo-100 p-2 rounded-xl text-indigo-700 shadow-sm">
                    <Clock size={20} />
                  </div>
                  Elige tu Turno
                </h3>
                <div className="grid gap-4">
                  {!formData.interestedGrade && (
                    <div className="p-8 bg-blue-50 rounded-2xl text-center text-blue-800">
                      <Info className="mx-auto mb-2" />
                      Selecciona primero el curso de interés.
                    </div>
                  )}
                  {formData.interestedGrade && relevantSlots.length === 0 && (
                    <div className="p-8 bg-slate-50 rounded-2xl text-center">
                      <p className="text-slate-500">
                        No hay fechas disponibles.
                      </p>
                    </div>
                  )}
                  {formData.interestedGrade &&
                    relevantSlots.map((slot) => {
                      const count =
                        slotOccupancy[`${slot.label}_${slot.times[0]}`] || 0;
                      const isFull = count >= MAX_CAPACITY;
                      const isHighDemand =
                        count >= HIGH_DEMAND_THRESHOLD && !isFull;
                      const isSelected = formData.selectedDate === slot.label;
                      const isClosedByAdmin = slotStatus[slot.id] === false;
                      const isBlocked = isFull || isClosedByAdmin;
                      return (
                        <div
                          key={slot.id}
                          className={`bg-white p-6 rounded-2xl border ${
                            isSelected
                              ? 'border-indigo-500 ring-2'
                              : 'border-slate-200'
                          } relative overflow-hidden`}
                        >
                          <div className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Calendar size={18} /> {slot.label}
                          </div>
                          {isHighDemand && !isBlocked && (
                            <div className="absolute top-0 right-0 bg-amber-100 text-amber-700 text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                              Alta demanda
                            </div>
                          )}
                          {isClosedByAdmin && (
                            <div className="absolute top-0 right-0 bg-red-100 text-red-700 text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                              Cerrado
                            </div>
                          )}
                          <div className="flex flex-wrap gap-3">
                            {slot.times.map((time) => (
                              <button
                                key={time}
                                type="button"
                                disabled={isBlocked}
                                onClick={() =>
                                  handleSlotSelect(slot.label, time)
                                }
                                className={`px-6 py-3 rounded-xl text-sm font-bold ${
                                  isBlocked
                                    ? 'bg-slate-100 text-slate-400'
                                    : isSelected
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-50 text-slate-600 border border-slate-200'
                                }`}
                              >
                                {time} {isFull && '(Completo)'}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </div>

                <div className="mt-12">
                  <div className="text-center mb-8">
                    <h4 className="text-lg font-bold text-slate-800 mb-2">
                      ¿No te encajan estos horarios?
                    </h4>
                    <p className="text-slate-500 text-sm">
                      Contacta con coordinación:
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {STAGE_CONTACTS.map((contact, idx) => {
                      const ContactIcon = contact.Icon;
                      return (
                        <div
                          key={idx}
                          className="flex items-start p-4 bg-white border border-slate-100 rounded-2xl shadow-sm"
                        >
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${contact.color} bg-opacity-20 shrink-0`}
                          >
                            <ContactIcon
                              size={20}
                              className={contact.color.split(' ')[0]}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="block text-xs font-bold uppercase text-slate-400">
                              {contact.stage}
                            </span>
                            <span className="block text-sm font-bold text-slate-800 truncate">
                              {contact.name}
                            </span>
                            <div
                              className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-1.5 rounded w-fit max-w-full mt-1 break-all"
                              title={contact.email}
                            >
                              <Mail size={12} className="shrink-0" />
                              {contact.email}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              <div className="pt-8 border-t border-slate-100">
                <div className="flex items-start gap-3 mb-8 p-4 bg-slate-50 rounded-xl">
                  <input
                    type="checkbox"
                    name="acceptPrivacy"
                    checked={formData.acceptPrivacy}
                    onChange={handleInputChange}
                    className="mt-1 w-5 h-5 text-indigo-600 border-slate-300 rounded"
                  />
                  <label className="text-sm text-slate-600">
                    Acepto la política de privacidad.
                  </label>
                </div>
                {formError && (
                  <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl font-semibold text-sm">
                    {formError}
                  </div>
                )}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-3 bg-white border border-slate-200 px-5 py-3 rounded-xl w-full md:w-auto">
                    <label className="text-sm font-bold text-slate-500 uppercase">
                      Asistentes:
                    </label>
                    <select
                      name="attendeesCount"
                      value={formData.attendeesCount}
                      onChange={handleInputChange}
                      className="bg-transparent border-none font-extrabold text-slate-900 focus:ring-0 text-lg outline-none"
                    >
                      {[1, 2, 3, 4].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-10 py-4 rounded-xl font-bold shadow-xl hover:shadow-indigo-200 transition-all hover:-translate-y-1"
                  >
                    {loading ? 'Procesando...' : 'Confirmar Reserva'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </main>
      )}

      {view === 'success' && (
        <main className="max-w-xl mx-auto px-4 py-24 text-center">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-12">
            <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">
              ¡Reserva Confirmada!
            </h2>
            <p className="text-slate-500 mb-8">
              Gracias <strong>{formData.parentName}</strong>.
            </p>
            <div className="bg-slate-50 rounded-2xl p-8 text-left mb-8 border border-slate-100 relative">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between border-b border-slate-200 pb-3">
                  <span className="text-slate-500">Día</span>
                  <span className="font-bold text-slate-900">
                    {formData.selectedDate}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-3">
                  <span className="text-slate-500">Hora</span>
                  <span className="font-bold text-indigo-700">
                    {formData.selectedTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Alumno/a</span>
                  <span className="font-bold text-slate-900">
                    {formData.childName}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl mb-8 border border-blue-100 text-sm">
              <p className="mb-2">
                <strong>Nota importante:</strong> Unos días antes de la visita
                nos pondremos en contacto contigo a través del email facilitado
                para recordarte la cita.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={addToGoogleCalendar}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <CalendarPlus size={20} /> Añadir a Google Calendar
              </button>

              <button
                onClick={() => {
                  setFormData({
                    parentName: '',
                    email: '',
                    phone: '',
                    childName: '',
                    childAge: '',
                    currentSchool: '',
                    interestedGrade: '',
                    selectedDate: '',
                    selectedTime: '',
                    attendeesCount: 1,
                    acceptPrivacy: false,
                  });
                  setView('landing');
                }}
                className="px-8 py-4 bg-slate-800 text-white rounded-xl font-bold"
              >
                Volver al Inicio
              </button>
            </div>
          </div>
        </main>
      )}

      {view === 'adminLogin' && (
        <main className="max-w-md mx-auto px-4 py-20">
          <div className="bg-white p-10 rounded-[2rem] shadow-2xl border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">
              Acceso Centro
            </h2>
            <form onSubmit={handleAdminLogin}>
              <input
                type="password"
                value={adminPassInput}
                onChange={(e) => setAdminPassInput(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-4 mb-6 text-slate-900 bg-white"
                placeholder="Contraseña"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setView('landing')}
                  className="w-1/2 py-3 bg-slate-100 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-indigo-900 text-white font-bold rounded-xl hover:bg-indigo-800 transition-colors"
                >
                  Entrar
                </button>
              </div>
            </form>
          </div>
        </main>
      )}

      {view === 'admin' && (
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900">
              Panel de Control
            </h2>
            <div className="flex gap-3">
              <button
                onClick={exportToCSV}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold"
              >
                Descargar CSV
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
            <h3 className="font-bold text-lg mb-4">Gestión de Fechas</h3>
            <form
              onSubmit={handleAddSlot}
              className="flex flex-wrap gap-4 mb-6"
            >
              <input
                type="date"
                value={newSlotDate}
                onChange={(e) => setNewSlotDate(e.target.value)}
                className="border p-2 rounded bg-white text-slate-900"
                required
              />
              <input
                type="time"
                value={newSlotTime}
                onChange={(e) => setNewSlotTime(e.target.value)}
                className="border p-2 rounded bg-white text-slate-900"
                required
              />
              <input
                type="text"
                value={newSlotLabel}
                onChange={(e) => setNewSlotLabel(e.target.value)}
                placeholder="Etiqueta"
                className="border p-2 rounded bg-white text-slate-900"
                required
              />
              <select
                value={newSlotGroup}
                onChange={(e) => setNewSlotGroup(e.target.value)}
                className="border p-2 rounded bg-white text-slate-900"
              >
                <option value="EI_EP">Infantil/Primaria</option>
                <option value="ESO_BTO">Secundaria/Bach</option>
              </select>
              <button
                type="submit"
                className="bg-blue-600 text-white p-2 rounded"
              >
                <PlusCircle />
              </button>
            </form>
            <div className="grid gap-4 md:grid-cols-3">
              {displaySlots.map((slot) => {
                const isClosed = slotStatus[slot.id] === false;
                return (
                  <div
                    key={slot.id}
                    className={`p-4 border rounded-xl flex justify-between items-center transition-colors ${
                      isClosed ? 'bg-red-50 border-red-200' : 'bg-white'
                    }`}
                  >
                    <div>
                      <div className="font-bold flex items-center gap-2">
                        {slot.label}
                        {isClosed && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full border border-red-200">
                            Cerrado
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">{slot.group}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          toggleSlotStatus(slot.id, slotStatus[slot.id])
                        }
                        className={`transition-colors p-1.5 rounded-lg ${
                          isClosed
                            ? 'text-red-500 hover:bg-red-100'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={
                          isClosed ? 'Desbloquear fecha' : 'Bloquear fecha'
                        }
                      >
                        {isClosed ? <Lock size={18} /> : <Unlock size={18} />}
                      </button>
                      {!String(slot.id).startsWith('def_') && (
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar fecha"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-4">Fecha Visita</th>
                  <th className="p-4">Familia</th>
                  <th className="p-4">Alumno (Curso Interés)</th>
                  <th className="p-4">Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.map((reg) => (
                  <tr key={reg.id} className="border-b last:border-0">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">
                        {reg.selectedDate}
                      </div>
                      <div className="text-xs text-slate-500">
                        {reg.selectedTime}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">
                        {reg.parentName}
                      </div>
                      <div className="flex flex-col gap-0.5 mt-1">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Mail size={10} /> {reg.email}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Phone size={10} /> {reg.phone}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">
                        {reg.childName}
                      </div>
                      <div className="mt-1">
                        <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded border border-indigo-100">
                          {reg.interestedGrade}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleDelete(reg.id)}
                        className="text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar inscripción"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      )}

      {/* Footer code remains same... */}
      <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900 mt-auto">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 text-sm">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white p-2 rounded-lg">
                <img src={LOGO_URL} alt="Logo" className="h-8 w-auto" />
              </div>
              <h4 className="text-white font-bold text-xl">
                Colegio San Buenaventura
              </h4>
            </div>
            <p className="mb-4 leading-relaxed max-w-sm text-slate-300">
              Somos referente educativo en la zona. Excelencia académica y
              valores franciscanos.
            </p>
            <div className="flex gap-4">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-white/20 text-white"
              >
                <Instagram size={20} />
              </a>
              <a
                href={`mailto:${DEFAULT_CONTACT_EMAIL}`}
                className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-white/20 text-white"
              >
                <Mail size={20} />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-white/20 text-white"
              >
                <Globe size={20} />
              </a>
            </div>
          </div>
          <div className="col-span-2">
            <h4 className="text-white font-bold text-lg mb-6">Ubicación</h4>
            <div className="space-y-4">
              <p className="flex items-start gap-3">
                <MapPin size={18} className="text-indigo-500 shrink-0 mt-0.5" />{' '}
                <span>
                  C/ de El Greco 16
                  <br />
                  28011, Madrid
                  <br />
                  (Distrito Latina)
                </span>
              </p>
              <div className="w-full h-56 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-800">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3038.273030380369!2d-3.754799923447954!3d40.40277397144122!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd41883a9928c23d%3A0x679c3c582570020!2sColegio%20San%20Buenaventura!5e0!3m2!1ses!2ses!4v1709230000000!5m2!1ses!2ses"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  title="Mapa Colegio San Buenaventura"
                ></iframe>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() =>
                  window.open(
                    'https://www.google.com/maps/dir/?api=1&destination=Colegio+San+Buenaventura+Madrid',
                    '_blank'
                  )
                }
                className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-500 transition-colors shadow-lg"
              >
                <Navigation size={18} />
                Cómo llegar
              </button>
            </div>
          </div>
        </div>
        <div className="text-center mt-16 pt-8 border-t border-slate-900 text-xs text-slate-600">
          © 2026 Colegio San Buenaventura Madrid. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
