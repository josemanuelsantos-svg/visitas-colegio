import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  signInWithCustomToken, 
  User as FirebaseUser 
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  deleteDoc,
  doc,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import {
  Calendar, Clock, Users, CheckCircle, Download, Trash2, Search,
  School, ChevronRight, User, Mail, Phone, Baby, Lock, MapPin,
  Globe, BookOpen, Info, MessageCircle, Star, ChevronDown, ChevronUp,
  Award, Waves, Utensils, Leaf, Cpu, Mic, Brain, Languages,
  FlaskConical, Gamepad2, Puzzle, Sparkles, Move, Plane, GraduationCap,
  Instagram, Music, Glasses, Printer, CalendarPlus, Coffee, Presentation,
  Dumbbell, FileText, Timer, AlertCircle, MonitorPlay, Library,
  Map as MapIcon, Footprints, ExternalLink, Sun, ArrowRight, XCircle,
  Ban, Settings, ToggleLeft, ToggleRight, Share2, Navigation, Copy,
  PlusCircle, RefreshCw, X, HeartHandshake, Wifi, ShieldCheck, Microscope,
  ClipboardCopy, AlertTriangle
} from 'lucide-react';

// --- Configuración de Firebase (HÍBRIDA: PREVIEW + PRODUCCIÓN) ---
const getFirebaseConfig = () => {
  if (typeof window !== 'undefined' && window.__firebase_config) {
    return JSON.parse(window.__firebase_config);
  }
  // Tu configuración de producción (Datos Reales)
  return {
    apiKey: 'AIzaSyAeiZxdEoAhjCxk2jhVOKc_A7Ag7a455QM',
    authDomain: 'inscripciones-jpa.firebaseapp.com',
    projectId: 'inscripciones-jpa',
    storageBucket: 'inscripciones-jpa.firebasestorage.app',
    messagingSenderId: '929100613235',
    appId: '1:929100613235:web:6677b72ffe6d74efa5cc06',
  };
};

const app = initializeApp(getFirebaseConfig());
const auth = getAuth(app);
const db = getFirestore(app);

// ID de la aplicación
const appId = (typeof window !== 'undefined' && window.__app_id) ? window.__app_id : 'inscripciones-web-publica';

// --- Constantes de Colecciones ---
const COLLECTION_NAME = 'open_house_registrations_v2_sanbuenaventura';
const CONFIG_COLLECTION_NAME = 'open_house_slots_config_v1';
const SLOTS_COLLECTION_NAME = 'open_house_slots_data_v1';

// --- Constantes de la App ---
const ADMIN_PASSWORD = 'Itinerarium@1274';
const DEFAULT_CONTACT_EMAIL = 'infantil@sanbuenaventura.org';
const INSTAGRAM_URL = 'https://www.instagram.com/cs_buenaventura/?hl=es';
const LOGO_URL = 'https://i.ibb.co/FLS9ybLj/cropped-Colegio-1.png';
const MICOLE_URL = 'https://www.micole.net/madrid/madrid/colegio-san-buenaventura';

// Fechas INICIALES (EI/EP)
const DEFAULT_EI_EP_SLOTS = [
  { id: 'def_1', date: '2026-02-17', label: 'Martes 17 de Febrero', times: ['14:20'], group: 'EI_EP' },
  { id: 'def_2', date: '2026-02-20', label: 'Viernes 20 de Febrero', times: ['09:10'], group: 'EI_EP' },
  { id: 'def_3', date: '2026-02-25', label: 'Miércoles 25 de Febrero', times: ['09:10'], group: 'EI_EP' },
  { id: 'def_4', date: '2026-02-27', label: 'Viernes 27 de Febrero', times: ['14:20'], group: 'EI_EP' },
  { id: 'def_5', date: '2026-03-02', label: 'Lunes 02 de Marzo', times: ['14:20'], group: 'EI_EP' },
  { id: 'def_6', date: '2026-03-11', label: 'Miércoles 11 de Marzo', times: ['09:10'], group: 'EI_EP' },
];

// Fechas NUEVAS (ESO)
const DEFAULT_ESO_SLOTS = [
  { id: 'eso_1', date: '2026-02-19', label: 'Jueves 19 de Febrero', times: ['16:30'], group: 'ESO' },
  { id: 'eso_2', date: '2026-02-20', label: 'Viernes 20 de Febrero', times: ['10:00'], group: 'ESO' },
  { id: 'eso_3', date: '2026-02-25', label: 'Miércoles 25 de Febrero', times: ['16:30'], group: 'ESO' },
  { id: 'eso_4', date: '2026-02-27', label: 'Viernes 27 de Febrero', times: ['10:00'], group: 'ESO' },
];

const FACILITIES_IMAGES = [
  { id: 1, title: 'Iglesia', img: 'https://i.ibb.co/N6DvggGM/20251213-Instalaciones-colegio-San-Buenaventura-0029.jpg', icon: Sparkles, cols: 'md:col-span-2' },
  { id: 9, title: 'Lab. STEAM', img: 'https://i.ibb.co/nqLPjHjg/1706700906038.jpg', icon: Cpu, cols: 'md:col-span-1' },
  { id: 8, title: 'Piscina', img: 'https://i.ibb.co/prLwgXph/20251220-Instalaciones-colegio-San-Buenaventura-0272.jpg', icon: Waves, cols: 'md:col-span-1' },
  { id: 2, title: 'Radio', img: 'https://i.ibb.co/8DpRPHzY/20251213-Instalaciones-colegio-San-Buenaventura-0108.jpg', icon: Mic, cols: 'md:col-span-1' },
  { id: 3, title: 'Ciencias', img: 'https://i.ibb.co/5ggD6m1t/20251213-Instalaciones-colegio-San-Buenaventura-0166.jpg', icon: FlaskConical, cols: 'md:col-span-1' },
  { id: 5, title: 'Psicomotricidad', img: 'https://i.ibb.co/TD04CVFL/20251213-Instalaciones-colegio-San-Buenaventura-0213.jpg', icon: Move, cols: 'md:col-span-2' },
  { id: 6, title: 'Infantil', img: 'https://i.ibb.co/bjm0FN1p/20251213-Instalaciones-colegio-San-Buenaventura-0217.jpg', icon: Baby, cols: 'md:col-span-1' },
  { id: 4, title: 'Comedor', img: 'https://i.ibb.co/kgcdMsrw/20251213-Instalaciones-colegio-San-Buenaventura-0194.jpg', icon: Utensils, cols: 'md:col-span-1' },
  { id: 7, title: 'Patio', img: 'https://i.ibb.co/N6pfsHw0/20251213-Instalaciones-colegio-San-Buenaventura-0228.jpg', icon: Sun, cols: 'md:col-span-2' },
];

const METODOLOGIA_DETALLADA = [
  {
    category: "Innovación Educativa",
    items: [
      { title: "Proyecto STEAM", desc: "Aprendizaje integrado de Ciencia, Tecnología, Ingeniería, Arte y Matemáticas.", icon: Cpu, color: "text-blue-600 bg-blue-50" },
      { title: "Competencia Digital", desc: "Aulas digitalizadas, uso de Chromebooks y entorno Google for Education.", icon: Wifi, color: "text-indigo-600 bg-indigo-50" },
      { title: "Laboratorios Vivos", desc: "Espacios de experimentación real en ciencias y robótica.", icon: Microscope, color: "text-emerald-600 bg-emerald-50" }
    ]
  },
  {
    category: "Idiomas y Comunicación",
    items: [
      { title: "Programa BEDA", desc: "Potenciación del inglés con auxiliares nativos y certificación Cambridge.", icon: Languages, color: "text-red-600 bg-red-50" },
      { title: "Radio Escolar", desc: "Desarrollo de la oratoria y habilidades comunicativas desde edades tempranas.", icon: Mic, color: "text-orange-600 bg-orange-50" },
      { title: "Proyectos Europeos", desc: "Apertura internacional y participación en programas Erasmus+.", icon: Globe, color: "text-cyan-600 bg-cyan-50" }
    ]
  },
  {
    category: "Atención al Alumno",
    items: [
      { title: "Acción Tutorial", desc: "Seguimiento individualizado y cercano para cada alumno y familia.", icon: HeartHandshake, color: "text-pink-600 bg-pink-50" },
      { title: "Departamento de Orientación", desc: "Equipo multidisciplinar para atender la diversidad y el talento.", icon: Brain, color: "text-violet-600 bg-violet-50" },
      { title: "Plan de Convivencia", desc: "Programa de alumnos ayudantes y mediación escolar.", icon: ShieldCheck, color: "text-amber-600 bg-amber-50" }
    ]
  }
];

const GRADES = [
  'Infantil 3 años', 'Infantil 4 años', 'Infantil 5 años',
  '1º Primaria', '2º Primaria', '3º Primaria', '4º Primaria', '5º Primaria', '6º Primaria',
  '1º ESO', '2º ESO', '3º ESO', '4º ESO', 
  '1º Bachillerato', '2º Bachillerato',
];

const STAGE_CONTACTS = [
  { stage: 'Infantil', name: 'Elena Díaz', role: 'Coordinadora', email: 'coordinacion.infantil@sanbuenaventura.org', Icon: Baby, color: 'text-emerald-600 bg-emerald-50' },
  { stage: 'Primaria', name: 'José Manuel Santos', role: 'Director Pedagógico', email: 'primaria@sanbuenaventura.org', Icon: BookOpen, color: 'text-blue-600 bg-blue-50' },
  { stage: 'Secundaria', name: 'Luis F. Redruello', role: 'Director Pedagógico', email: 'secundaria@sanbuenaventura.org', Icon: School, color: 'text-indigo-600 bg-indigo-50' },
  { stage: 'Bachillerato', name: 'Philippe Saint-Nard', role: 'Coordinador', email: 'coordinacion.bachillerato@sanbuenaventura.org', Icon: GraduationCap, color: 'text-violet-600 bg-violet-50' },
];

const TOUR_STOPS = [
  { name: 'Piscina', icon: Waves, color: 'bg-blue-100 text-blue-600' },
  { name: 'Infantil', icon: Baby, color: 'bg-pink-100 text-pink-600' },
  { name: 'Comedor', icon: Utensils, color: 'bg-emerald-100 text-emerald-600' },
  { name: 'Psicomotricidad', icon: Move, color: 'bg-orange-100 text-orange-600' },
  { name: 'STEAM', icon: Cpu, color: 'bg-indigo-100 text-indigo-600' },
  { name: 'Radio', icon: Mic, color: 'bg-red-100 text-red-600' },
  { name: 'Pastoral', icon: Sparkles, color: 'bg-yellow-100 text-yellow-600' },
];

const HIGH_DEMAND_THRESHOLD = 6;
const MAX_CAPACITY = 15;

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error' | 'info', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-indigo-50 border-indigo-200 text-indigo-800'
  };

  return (
    // Z-INDEX AUMENTADO A 300 PARA QUE SE VEA SOBRE EL MODAL DE CONFIRMACIÓN
    <div className={`fixed top-4 right-4 z-[300] flex items-center gap-3 px-6 py-4 rounded-xl border shadow-xl backdrop-blur-md animate-fade-in ${bgColors[type]}`}>
      {type === 'success' && <CheckCircle size={20} />}
      {type === 'error' && <AlertCircle size={20} />}
      {type === 'info' && <Info size={20} />}
      <span className="font-medium text-sm">{message}</span>
      <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity">
        <X size={16} />
      </button>
    </div>
  );
};

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, password, setPassword }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full mx-4 border border-slate-100">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900">¿Borrar registro?</h3>
          <p className="text-slate-500 text-sm mt-2">Esta acción no se puede deshacer. Introduce la clave para confirmar.</p>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Clave de administrador"
          className="w-full border border-slate-300 rounded-xl p-3 mb-6 focus:ring-2 focus:ring-red-500 outline-none text-center"
          autoFocus
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors">
            Cancelar
          </button>
          <button onClick={onConfirm} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200">
            Borrar
          </button>
        </div>
      </div>
    </div>
  );
};

const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
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
      <div className="flex gap-3 justify-center">
        {Object.keys(timeLeft).map((interval) => (
          <div key={interval} className="flex flex-col items-center bg-white/30 backdrop-blur-md rounded-lg p-2 min-w-[65px] border border-white/40 shadow-lg">
            <span className="text-xl md:text-2xl font-extrabold text-slate-800 drop-shadow-sm">
              {timeLeft[interval as keyof typeof timeLeft]}
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
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [view, setView] = useState('landing');
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [slotStatus, setSlotStatus] = useState<any>({});
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [formData, setFormData] = useState({
    parentName: '', email: '', phone: '', childName: '',
    childAge: '', interestedGrade: '', selectedDate: '',
    selectedTime: '', attendeesCount: 1, acceptPrivacy: false,
  });
  const [adminPassInput, setAdminPassInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [newSlotDate, setNewSlotDate] = useState('');
  const [newSlotTime, setNewSlotTime] = useState('');
  const [newSlotLabel, setNewSlotLabel] = useState('');
  const [newSlotGroup, setNewSlotGroup] = useState('EI_EP');

  // --- DELETE MODAL STATE ---
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState('');

  // Funciones auxiliares para rutas seguras (Compatibilidad Preview + Producción)
  const getPublicDataRef = (colName: string) => collection(db, 'artifacts', appId, 'public', 'data', colName);
  const getPublicDocRef = (colName: string, docId: string) => doc(db, 'artifacts', appId, 'public', 'data', colName, docId);

  const slotOccupancy = useMemo(() => {
    const counts: any = {};
    registrations.forEach((reg) => {
      if (reg.selectedDate && reg.selectedTime) {
        const key = `${reg.selectedDate}_${reg.selectedTime}`;
        counts[key] = (counts[key] || 0) + 1;
      }
    });
    return counts;
  }, [registrations]);

  const displaySlots = useMemo(() => {
    const combined = [...DEFAULT_EI_EP_SLOTS, ...DEFAULT_ESO_SLOTS, ...availableSlots];
    return combined.sort((a, b) => {
      if (a.date < b.date) return -1;
      if (a.date > b.date) return 1;
      return a.times[0].localeCompare(b.times[0]);
    });
  }, [availableSlots]);

  const slotsEI_EP = displaySlots.filter((s) => s.group === 'EI_EP');
  const slotsESO = displaySlots.filter((s) => s.group === 'ESO');

  const isBachillerato = formData.interestedGrade.includes('Bachillerato');
  
  let relevantSlots: any[] = [];
  if (formData.interestedGrade) {
    if (isBachillerato) {
      relevantSlots = []; 
    } else {
      const isESO = ['1º ESO', '2º ESO', '3º ESO', '4º ESO'].includes(formData.interestedGrade);
      relevantSlots = isESO ? slotsESO : slotsEI_EP;
    }
  }

  useEffect(() => { window.scrollTo(0, 0); }, [view]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auth Initialization Pattern
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof window !== 'undefined' && window.__initial_auth_token) {
          await signInWithCustomToken(auth, window.__initial_auth_token);
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

  // Data Fetching Pattern
  useEffect(() => {
    if (!user) return;

    // Registros
    const unsubReg = onSnapshot(query(getPublicDataRef(COLLECTION_NAME)), 
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }));
        data.sort((a: any, b: any) => b.createdAt - a.createdAt);
        setRegistrations(data);
        setLoading(false);
      }, (error) => console.error("Error fetching registrations", error)
    );

    // Configuración de slots
    const unsubConfig = onSnapshot(query(getPublicDataRef(CONFIG_COLLECTION_NAME)),
      (snap) => {
        const config: any = {};
        snap.docs.forEach((d) => (config[d.id] = d.data().isOpen));
        setSlotStatus(config);
      }, (error) => console.error("Error fetching config", error)
    );

    // Nuevos Slots creados por admin
    const unsubSlots = onSnapshot(query(getPublicDataRef(SLOTS_COLLECTION_NAME)),
      (snap) => {
        const slots = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        slots.sort((a: any, b: any) => a.date > b.date ? 1 : -1);
        setAvailableSlots(slots);
      }, (error) => console.error("Error fetching slots", error)
    );

    return () => { unsubReg(); unsubConfig(); unsubSlots(); };
  }, [user]);

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ msg, type });
  };

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (name === 'interestedGrade') setFormData((prev) => ({ ...prev, selectedDate: '', selectedTime: '' }));
    if (formError) setFormError('');
  };

  const handleSlotSelect = (date: string, time: string) => {
    setFormData((prev) => ({ ...prev, selectedDate: date, selectedTime: time }));
    if (formError) setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.parentName || !formData.email || !formData.phone) return setFormError('Completa los datos de contacto.');
    if (!formData.interestedGrade) return setFormError('Selecciona el curso de interés.');
    
    if (!isBachillerato && !formData.selectedDate) return setFormError('Selecciona una fecha y hora.');
    
    if (!formData.acceptPrivacy) return setFormError('Acepta la política de privacidad.');

    setLoading(true);
    try {
      const dataToSave = {
        ...formData,
        selectedDate: isBachillerato ? 'Visita Individual' : formData.selectedDate,
        selectedTime: isBachillerato ? 'A concertar' : formData.selectedTime,
        createdAt: Timestamp.now(), 
        status: 'confirmed' 
      };

      await addDoc(getPublicDataRef(COLLECTION_NAME), dataToSave);
      await new Promise((resolve) => setTimeout(resolve, 600));
      setView('success');
    } catch (error) {
      setFormError('Error al guardar. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE LOGIC ---
  const handleDeleteClick = (id: string) => {
    setSelectedDeleteId(id);
    setDeletePassword('');
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deletePassword !== ADMIN_PASSWORD) {
      showToast('Contraseña incorrecta', 'error');
      return;
    }
    if (selectedDeleteId) {
      try {
        await deleteDoc(getPublicDocRef(COLLECTION_NAME, selectedDeleteId));
        showToast('Registro eliminado correctamente', 'info');
        setShowDeleteModal(false);
        setDeletePassword('');
        setSelectedDeleteId(null);
      } catch (error) {
        console.error('Error deleting:', error);
        showToast('Error al eliminar', 'error');
      }
    }
  };

  const toggleSlotStatus = async (slotId: string, currentStatus: boolean) => {
    const newStatus = currentStatus === undefined ? false : !currentStatus;
    try {
      await setDoc(getPublicDocRef(CONFIG_COLLECTION_NAME, slotId), { isOpen: newStatus });
      showToast(newStatus ? 'Fecha abierta' : 'Fecha cerrada', 'success');
    } catch (err) { console.error(err); }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassInput === ADMIN_PASSWORD) {
      setView('admin');
      setAdminPassInput('');
      showToast('Sesión de administrador iniciada', 'success');
    } else {
      showToast('Contraseña incorrecta', 'error');
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotDate) return;
    try {
      await addDoc(getPublicDataRef(SLOTS_COLLECTION_NAME), {
        date: newSlotDate,
        times: [newSlotTime],
        label: newSlotLabel,
        group: newSlotGroup,
      });
      setNewSlotDate('');
      showToast('Fecha añadida correctamente', 'success');
    } catch (err) { console.error(err); }
  };

  const handleDeleteSlot = async (id: string) => {
    if(!confirm('¿Eliminar esta fecha adicional?')) return;
    try {
      await deleteDoc(getPublicDocRef(SLOTS_COLLECTION_NAME, id));
      showToast('Fecha eliminada', 'info');
    } catch (err) { console.error(err); }
  };
   
  const toggleFaq = (index: number) => setOpenFaq(openFaq === index ? null : index);
  
  const exportToCSV = () => {
    if (registrations.length === 0) {
      showToast('No hay registros para exportar', 'info');
      return;
    }

    const headers = ['Fecha Registro', 'Nombre Tutor', 'Email', 'Teléfono', 'Nombre Alumno', 'Año Nacimiento', 'Curso Interés', 'Fecha Visita', 'Hora Visita', 'Asistentes'];
    const csvRows = [
      headers.join(','),
      ...registrations.map(row => {
        const fechaReg = row.createdAt instanceof Date ? row.createdAt.toLocaleString('es-ES') : new Date(row.createdAt.seconds * 1000).toLocaleString('es-ES');
        return [
          `"${fechaReg}"`, `"${row.parentName || ''}"`, `"${row.email || ''}"`, `"${row.phone || ''}"`,
          `"${row.childName || ''}"`, `"${row.childAge || ''}"`, `"${row.interestedGrade || ''}"`,
          `"${row.selectedDate || ''}"`, `"${row.selectedTime || ''}"`, `"${row.attendeesCount || ''}"`
        ].join(',');
      })
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `inscripciones_JPA_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Archivo CSV descargado correctamente', 'success');
  };

  // --- FUNCIÓN DE COPIAR A PORTAPAPELES (Formato Excel/Sheets) ---
  const copyToClipboard = () => {
    if (registrations.length === 0) {
      showToast('No hay registros para copiar', 'info');
      return;
    }
    const headers = ['Fecha Registro', 'Nombre Tutor', 'Email', 'Teléfono', 'Nombre Alumno', 'Año Nacimiento', 'Curso Interés', 'Fecha Visita', 'Hora Visita', 'Asistentes'];
    const rows = registrations.map(row => {
      const fechaReg = row.createdAt instanceof Date ? row.createdAt.toLocaleString('es-ES') : new Date(row.createdAt.seconds * 1000).toLocaleString('es-ES');
      return [
        fechaReg, row.parentName, row.email, row.phone, row.childName, row.childAge, 
        row.interestedGrade, row.selectedDate, row.selectedTime, row.attendeesCount
      ].join('\t');
    });
    const clipboardText = [headers.join('\t'), ...rows].join('\n');

    // Método compatible con iframes/sandbox (execCommand)
    const textArea = document.createElement("textarea");
    textArea.value = clipboardText;
    
    // Estilos para ocultarlo sin que afecte al layout
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        showToast('¡Datos copiados! Pégalos en tu Google Sheet (Ctrl+V)', 'success');
      } else {
        showToast('Error al copiar. Por favor usa "Descargar CSV".', 'error');
      }
    } catch (err) {
      console.error('Error al copiar: ', err);
      showToast('Error al copiar. Por favor usa "Descargar CSV".', 'error');
    }
    
    document.body.removeChild(textArea);
  };

  const filteredRegistrations = useMemo(() => {
    return registrations.filter(
      (r) =>
        r.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.childName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [registrations, searchTerm]);

  const addToGoogleCalendar = () => {
    if (formData.selectedDate === 'Visita Individual') {
      showToast('Las visitas individuales se agendan personalmente.', 'info');
      return;
    }
    const slot = displaySlots.find(s => s.label === formData.selectedDate);
    let datesParam = "";
    if (slot && slot.date && formData.selectedTime) {
      try {
        const startDateStr = `${slot.date}T${formData.selectedTime}:00`;
        const startDate = new Date(startDateStr);
        const endDate = new Date(startDate.getTime() + (2 * 60 * 60 * 1000));
        const formatGCal = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, '');
        datesParam = `&dates=${formatGCal(startDate)}/${formatGCal(endDate)}`;
      } catch (e) { console.error("Error parsing date", e); }
    }
    const title = encodeURIComponent("Jornada Puertas Abiertas - San Buenaventura");
    const details = encodeURIComponent(`Visita para: ${formData.childName}. Curso: ${formData.interestedGrade}`);
    const location = encodeURIComponent("Colegio San Buenaventura, C/ de El Greco 16, 28011 Madrid");
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}${datesParam}`;
    window.open(url, '_blank');
  };

  if (!user && loading) return <div className="min-h-screen flex items-center justify-center text-indigo-800 font-medium">Cargando aplicación...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-indigo-100 selection:text-indigo-800">
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        @keyframes bounce-slow { 0%, 100% { transform: translateY(-5%); } 50% { transform: translateY(5%); } }
        .animate-bounce-slow { animation: bounce-slow 3s infinite ease-in-out; }
      `}</style>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      
      <DeleteConfirmModal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
        onConfirm={confirmDelete}
        password={deletePassword}
        setPassword={setDeletePassword}
      />

      {/* Botón Flotante */}
      {view === 'landing' && (
        <div className="fixed bottom-8 right-8 z-[60] animate-bounce-slow" style={{ animationDelay: '0.5s' }}>
          <button
            type="button"
            onClick={() => setView('form')}
            className="group bg-gradient-to-r from-indigo-700 to-blue-600 text-white px-7 py-4 rounded-full font-bold shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-3 border-[3px] border-white/20 backdrop-blur-sm"
          >
            <Calendar size={22} className="group-hover:animate-pulse" />
            <span className="text-lg tracking-wide">Reservar Visita</span>
          </button>
        </div>
      )}

      {/* Banner Superior */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white px-4 py-3 text-center text-sm font-bold shadow-md relative z-50 flex justify-center items-center gap-2 tracking-wide">
        <Info size={18} className="text-white/90" />
        <span className="drop-shadow-sm">
          Plazo Oficial de Admisión 25-26: <span className="bg-white/20 px-2 py-0.5 rounded-md ml-1">Del 11 al 25 de Marzo</span>
        </span>
      </div>

      {/* Header */}
      <header className={`sticky top-0 left-0 w-full z-40 transition-all duration-500 ease-in-out ${scrolled ? 'bg-white/90 backdrop-blur-xl shadow-lg py-3 border-b border-indigo-100/50' : 'bg-white/40 backdrop-blur-sm py-5 border-b border-transparent'}`}>
        <div className="absolute top-0 left-0 h-[3px] bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-150 z-50 w-full"></div>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setView('landing')}>
            <img src={LOGO_URL} alt="Logo Colegio" className={`transition-all duration-500 ${scrolled ? 'h-10 w-auto' : 'h-14 w-auto'} drop-shadow-sm`} />
            <div>
              <h1 className={`font-bold text-slate-900 leading-none tracking-tight group-hover:text-indigo-800 transition-colors duration-300 ${scrolled ? 'text-lg' : 'text-xl md:text-2xl'}`}>
                Colegio San Buenaventura
              </h1>
              <p className="text-[10px] md:text-xs text-indigo-700 font-bold uppercase tracking-[0.2em] mt-1 opacity-80">
                Franciscanos Menores
              </p>
            </div>
          </div>
          {view !== 'admin' && view !== 'adminLogin' && (
            <button
              type="button"
              onClick={() => setView('adminLogin')}
              className={`text-xs font-bold transition-all duration-300 uppercase tracking-widest px-5 py-2 rounded-full border ${scrolled ? 'text-indigo-700 bg-indigo-50 border-indigo-100 hover:bg-indigo-100' : 'text-slate-700 bg-white/80 border-slate-200 hover:border-indigo-400 hover:text-indigo-700 shadow-sm'}`}
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
          <main className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32">
            <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-200/30 rounded-full blur-[100px] animate-pulse"></div>
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] bg-blue-200/20 rounded-full blur-[120px]"></div>
            </div>
            <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
              <CountdownTimer targetDate="2026-03-11T09:00:00" />
              <div className="max-w-4xl mx-auto mb-10 bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white shadow-xl animate-fade-in">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {/* Columna EI/EP */}
                  <div className="flex-1 w-full">
                    <h3 className="text-left text-slate-900 font-bold text-lg mb-3 flex items-center gap-2">
                      <Baby className="w-5 h-5 text-indigo-600" /> Ed. Infantil y Primaria
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-left">
                      {slotsEI_EP.length > 0 ? (
                        slotsEI_EP.map((slot) => (
                          <div key={slot.id} className="flex justify-between items-center text-sm border-b border-indigo-100 last:border-0 sm:last:border-b py-1">
                            <span className="text-slate-700">{slot.label}</span>
                            <span className="font-bold text-indigo-700">{slot.times.join(', ')}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm italic text-slate-500">Cargando fechas...</p>
                      )}
                    </div>
                  </div>
                  {/* Columna ESO */}
                  <div className="w-full md:w-auto md:min-w-[300px] border-t md:border-t-0 md:border-l border-indigo-100 pt-4 md:pt-0 md:pl-6 flex flex-col justify-start">
                    <h4 className="text-left text-slate-900 font-bold text-lg mb-3 flex items-center gap-2">
                      <School className="w-5 h-5 text-indigo-600" /> Ed. Secundaria
                    </h4>
                    {slotsESO.length > 0 ? (
                      <div className="space-y-2 text-left w-full">
                        {slotsESO.map((s) => (
                          <div key={s.id} className="flex justify-between items-center text-sm border-b border-indigo-100 last:border-0 py-1">
                            <span className="text-slate-700">{s.label}</span>
                            <span className="font-bold text-indigo-700">{s.times[0]}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic bg-slate-100 p-2 rounded">Próximamente nuevas fechas</p>
                    )}
                    <div className="mt-4 p-3 bg-indigo-50 rounded-lg text-xs text-indigo-800 text-left">
                       <strong>Bachillerato:</strong> Visitas individuales personalizadas. Solicítalo en el formulario.
                    </div>
                  </div>
                </div>
              </div>
              <h2 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-8 tracking-tight leading-[1.1]">
                Innovación, Valores y<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-blue-600 to-indigo-500 drop-shadow-sm">Excelencia Educativa</span>
              </h2>
              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <button type="button" onClick={() => setView('form')} className="group bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden">
                  <span className="relative z-10 flex items-center gap-2">Reservar Mi Visita <ChevronRight size={20} /></span>
                  <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-indigo-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </button>
              </div>
            </div>
          </main>

          {/* Testimonios Micole */}
          <section className="py-12 bg-white/50 relative z-20 -mt-10 mb-10">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-8">
                <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-2">Lo que dicen las familias</p>
                <div className="flex justify-center items-center gap-2">
                   <div className="flex text-amber-400">
                     {[...Array(5)].map((_, i) => <Star key={i} fill="currentColor" size={20} />)}
                   </div>
                   <span className="font-bold text-slate-800">4.9/5 en Micole</span>
                </div>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { text: "Un colegio de referencia. Ambiente cercano y familiar.", author: "P. P.", role: "Familia del Centro" },
                  { text: "Trato personal magnífico. Mi hija se siente motivada.", author: "M. M.", role: "Madre de alumna" },
                  { text: "El colegio de mis nietas. Muy bueno, nos tratan muy bien.", author: "N. G.", role: "Abuela de alumnas" },
                  { text: "El mejor colegio de la historia. Mi prima va y le encanta.", author: "A. J. O.", role: "Familiar de alumna" }
                ].map((testimonial, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="flex text-amber-400 mb-3">
                      {[...Array(5)].map((_, j) => <Star key={j} fill="currentColor" size={14} />)}
                    </div>
                    <p className="text-slate-600 text-sm italic mb-4">"{testimonial.text}"</p>
                    <div className="text-xs">
                      <span className="font-bold text-slate-900 block">{testimonial.author}</span>
                      <span className="text-slate-400">{testimonial.role}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-8">
                <a href={MICOLE_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-indigo-600 text-sm font-bold hover:underline">
                  Ver todas las opiniones en Micole <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </section>

          {/* Instalaciones (Espacios) */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                <h3 className="text-4xl font-extrabold text-slate-900 mb-4">Espacios para crecer</h3>
                <p className="text-slate-500 max-w-2xl mx-auto">Instalaciones modernas y cuidadas diseñadas para el aprendizaje y bienestar de nuestros alumnos.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {FACILITIES_IMAGES.map((item) => {
                  const FacilityIcon = item.icon;
                  return (
                    <div key={item.id} className={`${item.cols} relative h-64 rounded-3xl overflow-hidden group shadow-lg cursor-pointer`}>
                      <img src={item.img} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
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

          {/* Agenda */}
          <div className="max-w-4xl mx-auto px-6 py-24 bg-slate-50">
            <div className="text-center mb-16">
              <span className="text-indigo-600 font-bold uppercase tracking-wider text-sm">Tu visita</span>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2">Agenda de la Jornada</h3>
            </div>
            <div className="relative">
              <div className="absolute left-[28px] md:left-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-indigo-100 via-indigo-200 to-indigo-100 md:-translate-x-1/2"></div>
              <div className="space-y-12">
                {[
                  { time: "10'", title: 'Bienvenida Institucional', desc: 'Recepción por el equipo de titularidad.', icon: <User size={20} />, color: 'text-blue-600 bg-blue-50' },
                  { time: "50'", title: 'Visita Guiada Integral', desc: 'Recorrido detallado por nuestras instalaciones.', icon: <MapIcon size={20} />, color: 'text-emerald-600 bg-emerald-50', details: TOUR_STOPS },
                  { time: "10'", title: 'Proceso de Admisión', desc: 'Explicación breve de plazos.', icon: <FileText size={20} />, color: 'text-amber-600 bg-amber-50' },
                  { time: "20'", title: 'Café y Dudas', desc: 'Espacio distendido.', icon: <Coffee size={20} />, color: 'text-indigo-600 bg-indigo-50' },
                ].map((item, idx) => (
                  <div key={idx} className={`relative flex items-start md:justify-between group ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                    <div className="hidden md:block md:w-[45%]"></div>
                    <div className={`absolute left-0 md:left-1/2 -translate-x-[2px] md:-translate-x-1/2 w-14 h-14 border-4 border-white rounded-full flex items-center justify-center shadow-lg z-10 ${item.color}`}>
                      {item.icon}
                    </div>
                    <div className="ml-20 md:ml-0 md:w-[45%] bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-indigo-100 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-lg text-slate-800">{item.title}</h4>
                        <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-md">{item.time}</span>
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed mb-3">{item.desc}</p>
                      {item.details && (
                        <div className="mt-6 pt-4 border-t border-slate-50">
                          <div className="grid grid-cols-2 gap-3">
                            {item.details.map((stop, i) => {
                              const StopIcon = stop.icon;
                              return (
                                <div key={i} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-100">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${stop.color}`}>
                                    <StopIcon size={14} />
                                  </div>
                                  <span className="text-xs font-bold text-slate-600">{stop.name}</span>
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

          {/* Nueva Metodología Premium */}
          <div className="py-24 bg-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-50 to-transparent opacity-50 pointer-events-none"></div>
            <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="text-center mb-16">
                <span className="text-indigo-600 font-bold uppercase tracking-wider text-sm">Nuestro Proyecto</span>
                <h3 className="text-4xl font-extrabold text-slate-900 mt-2 mb-4">Excelencia Educativa</h3>
                <p className="text-slate-500 max-w-2xl mx-auto text-lg">
                  Formamos personas competentes, críticas y comprometidas a través de una metodología innovadora y valores sólidos.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                {METODOLOGIA_DETALLADA.map((section, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-3xl p-8 border border-slate-100 shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                    <h4 className="text-xl font-bold text-slate-900 mb-6 pb-4 border-b border-slate-200">
                      {section.category}
                    </h4>
                    <div className="space-y-6 flex-1">
                      {section.items.map((item, i) => {
                        const ItemIcon = item.icon;
                        return (
                          <div key={i} className="flex gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${item.color}`}>
                              <ItemIcon size={22} />
                            </div>
                            <div>
                              <h5 className="font-bold text-slate-800 text-sm mb-1">{item.title}</h5>
                              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FAQ */}
          <section className="max-w-4xl mx-auto my-24 px-6">
            <h3 className="text-3xl font-extrabold text-center mb-12 text-slate-900">Preguntas Frecuentes</h3>
            <div className="space-y-4">
              {[
                { 
                  q: '¿Cuándo es el periodo oficial de admisión?', 
                  a: 'El plazo oficial de presentación de solicitudes para el curso 2025-26 es del 11 al 25 de Marzo, ambos inclusive. Te ayudamos con todo el proceso.' 
                },
                { 
                  q: '¿Qué valores definen la identidad del centro?', 
                  a: (
                    <div className="space-y-2">
                      <p>Como centro de la Orden Franciscana, nuestra propuesta educativa se basa en los valores de <strong>Paz y Bien, Fraternidad, Sencillez, Humildad y Alegría</strong>.</p>
                      <p>Fomentamos especialmente la <strong>conciencia ecológica</strong> y el respeto por el medio ambiente, así como la preferencia por los más desfavorecidos, educando para la vida y favoreciendo la autonomía y el espíritu crítico.</p>
                    </div>
                  )
                },
                { 
                  q: '¿Cómo funciona el Departamento de Orientación?', 
                  a: 'Nuestro equipo realiza un seguimiento íntegro y personalizado del alumnado. Trabajamos en coordinación continua con familias y tutores para atender la diversidad, detectar necesidades específicas y ofrecer apoyo psicopedagógico. En Bachillerato, el acompañamiento vocacional y profesional es clave.' 
                },
                { 
                  q: '¿Qué oferta tecnológica y digital tienen?', 
                  a: 'Contamos con un Plan Digital integrado. Disponemos de red Wifi en todo el centro, uso de plataformas como Google Classroom y Moodle, pizarras digitales interactivas y proyectos de robótica/STEAM. Buscamos que la tecnología sea una herramienta al servicio del aprendizaje.' 
                },
                { 
                  q: '¿Qué es el Programa BEDA en Bachillerato?', 
                  a: (
                    <div className="space-y-2">
                       <p>En Bachillerato potenciamos el inglés a través del <strong>Programa BEDA</strong>, que incluye:</p>
                       <ul className="list-disc pl-5 mt-1 space-y-1">
                         <li>Auxiliares de conversación nativos.</li>
                         <li>Preparación para exámenes oficiales de Cambridge.</li>
                         <li>Enfoque comunicativo y práctico del idioma.</li>
                       </ul>
                    </div>
                  )
                },
                { 
                  q: '¿Cuáles son los horarios lectivos?', 
                  a: (
                    <div className="space-y-2">
                      <p><strong className="text-slate-800">Infantil y Primaria (Jornada Partida):</strong><br/> 8:45/9:00 a 12:15/12:30 y 14:00/14:15 a 16:00/16:15.</p>
                      <p><strong className="text-slate-800">ESO y Bachillerato (Jornada Continuada):</strong><br/> De 8:15 a 14:15.</p>
                    </div>
                  ) 
                },
                { 
                  q: '¿Puedo ir con mi hijo/a a la visita?', 
                  a: '¡Por supuesto! Nos encanta que los futuros alumnos conozcan el colegio y la visita está pensada también para ellos.' 
                },
                { 
                  q: '¿Tenéis cocina propia?', 
                  a: 'Sí, contamos con cocina propia en las instalaciones. Nuestros menús se elaboran diariamente atendiendo a necesidades dietéticas y alergias.' 
                },
                { 
                  q: '¿Hay servicio de horario ampliado?', 
                  a: "Sí, disponemos de servicio de 'Madrugadores' con opción de desayuno para facilitar la conciliación familiar." 
                },
                 { 
                  q: '¿Es obligatorio el uniforme?', 
                  a: 'Sí, el uso del uniforme escolar y la equipación deportiva es obligatorio en Infantil, Primaria y ESO. En Bachillerato no es necesario.' 
                },
              ].map((item, idx) => (
                <div key={idx} className={`border rounded-2xl transition-all duration-300 overflow-hidden ${openFaq === idx ? 'bg-indigo-50 border-indigo-200 shadow-md' : 'bg-white border-slate-200 hover:border-indigo-300'}`}>
                  <button onClick={() => toggleFaq(idx)} className={`w-full flex justify-between items-center p-6 text-left font-bold transition-colors ${openFaq === idx ? 'text-indigo-800' : 'text-slate-800 hover:text-indigo-800'}`}>
                    <span className="text-lg pr-4">{item.q}</span>
                    {openFaq === idx ? <ChevronUp size={24} className="text-indigo-600 shrink-0" /> : <ChevronDown size={24} className="text-slate-400 shrink-0" />}
                  </button>
                  <div className={`bg-white transition-all duration-300 ease-in-out ${openFaq === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="p-6 pt-0 text-slate-600 leading-relaxed bg-white border-t border-slate-100">{item.a}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {view === 'form' && (
        <main className="max-w-3xl mx-auto px-4 py-12 relative z-10 animate-fade-in">
          <button onClick={() => setView('landing')} className="text-slate-500 hover:text-indigo-800 mb-8 flex items-center gap-2 text-sm font-medium transition-colors group">
            <span className="bg-white p-2 rounded-full shadow-sm border border-slate-200 group-hover:border-indigo-300 transition-colors">
              <ChevronRight className="rotate-180" size={16} />
            </span>
            Volver al inicio
          </button>

          <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 overflow-hidden border border-white relative">
            <div className="h-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 relative z-10"></div>
            <div className="p-10 pb-0 relative z-10">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Reserva tu Visita</h2>
              <p className="text-slate-500">Completa el formulario para asegurar tu plaza.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-12 relative z-10">
              <section className="bg-white/60 p-8 rounded-3xl border border-slate-200/60 shadow-sm backdrop-blur-sm">
                <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-3 mb-6">
                  <div className="bg-indigo-100 p-2 rounded-xl text-indigo-700 shadow-sm"><User size={20} /></div>
                  Datos de la Familia
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nombre y Apellidos</label>
                    <input required type="text" name="parentName" value={formData.parentName} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-xl p-4 text-slate-900" placeholder="Ej. María García" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-xl p-4 text-slate-900" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Teléfono</label>
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-xl p-4 text-slate-900" />
                  </div>
                </div>
              </section>

              <section className="bg-white/60 p-8 rounded-3xl border border-slate-200/60 shadow-sm backdrop-blur-sm">
                <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-3 mb-6">
                  <div className="bg-indigo-100 p-2 rounded-xl text-indigo-700 shadow-sm"><Baby size={20} /></div>
                  Datos del Alumno/a
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nombre</label>
                    <input required type="text" name="childName" value={formData.childName} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-xl p-4 text-slate-900" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Año Nacimiento</label>
                    <input required type="number" name="childAge" value={formData.childAge} onChange={handleInputChange} className="w-full bg-white border border-slate-200 rounded-xl p-4 text-slate-900" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Curso de Interés</label>
                    <select name="interestedGrade" value={formData.interestedGrade} onChange={handleInputChange} required className="w-full bg-white border border-slate-200 rounded-xl p-4 text-slate-900">
                      <option value="">Selecciona curso...</option>
                      {GRADES.map((grade) => <option key={grade} value={grade}>{grade}</option>)}
                    </select>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-3 mb-6">
                  <div className="bg-indigo-100 p-2 rounded-xl text-indigo-700 shadow-sm"><Clock size={20} /></div>
                  Elige tu Turno
                </h3>
                <div className="grid gap-4">
                  {!formData.interestedGrade && (
                    <div className="p-8 bg-blue-50 rounded-2xl text-center text-blue-800 border border-blue-100">
                      <Info className="mx-auto mb-2" /> Selecciona primero el curso de interés para ver los horarios disponibles.
                    </div>
                  )}

                  {/* CASO BACHILLERATO: Mensaje especial */}
                  {formData.interestedGrade && isBachillerato && (
                    <div className="p-8 bg-indigo-50 rounded-2xl border border-indigo-100 flex flex-col items-center text-center">
                       <GraduationCap size={48} className="text-indigo-600 mb-4" />
                       <h4 className="text-xl font-bold text-indigo-900 mb-2">Visita Personalizada</h4>
                       <p className="text-slate-600 max-w-md">
                         Para la etapa de Bachillerato realizamos visitas individuales adaptadas a las necesidades académicas del alumno.
                         <br/><br/>
                         <strong>Completa tus datos y finaliza la reserva.</strong> Nos pondremos en contacto contigo para agendar una cita personal.
                       </p>
                    </div>
                  )}

                  {/* CASO RESTO CURSOS: Muestra Slots */}
                  {formData.interestedGrade && !isBachillerato && relevantSlots.length === 0 && (
                    <div className="p-8 bg-slate-50 rounded-2xl text-center text-slate-500">No hay fechas disponibles actualmente para este curso.</div>
                  )}
                  {formData.interestedGrade && !isBachillerato && relevantSlots.map((slot) => {
                    const count = slotOccupancy[`${slot.label}_${slot.times[0]}`] || 0;
                    const isFull = count >= MAX_CAPACITY;
                    const isHighDemand = count >= HIGH_DEMAND_THRESHOLD && !isFull;
                    const isSelected = formData.selectedDate === slot.label;
                    const isClosedByAdmin = slotStatus[slot.id] === false;
                    const isBlocked = isFull || isClosedByAdmin;
                    
                    return (
                      <div key={slot.id} className={`bg-white p-6 rounded-2xl border transition-all ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-200'} relative overflow-hidden`}>
                        <div className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Calendar size={18} /> {slot.label}</div>
                        {isHighDemand && !isBlocked && <div className="absolute top-0 right-0 bg-amber-100 text-amber-700 text-[10px] font-bold px-3 py-1 rounded-bl-xl">Alta demanda</div>}
                        {isClosedByAdmin && <div className="absolute top-0 right-0 bg-red-100 text-red-700 text-[10px] font-bold px-3 py-1 rounded-bl-xl">Cerrado</div>}
                        <div className="flex flex-wrap gap-3">
                          {slot.times.map((time: string) => (
                            <button key={time} type="button" disabled={isBlocked} onClick={() => handleSlotSelect(slot.label, time)} className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${isBlocked ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : isSelected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-indigo-300'}`}>
                              {time} {isFull && '(Completo)'}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Contactos de Coordinación */}
                <div className="mt-12">
                   <div className="text-center mb-8">
                     <h4 className="text-lg font-bold text-slate-800 mb-2">¿No te encajan estos horarios?</h4>
                     <p className="text-slate-500 text-sm">Contacta directamente con coordinación:</p>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {STAGE_CONTACTS.map((contact, idx) => {
                       const ContactIcon = contact.Icon;
                       return (
                         <div key={idx} className="flex items-start p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                           <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${contact.color} bg-opacity-20 shrink-0`}>
                             <ContactIcon size={20} className={contact.color.split(' ')[0]} />
                           </div>
                           <div className="flex-1 min-w-0">
                             <span className="block text-xs font-bold uppercase text-slate-400">{contact.stage}</span>
                             <span className="block text-sm font-bold text-slate-800 truncate">{contact.name}</span>
                             <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-1.5 rounded w-fit max-w-full mt-1 break-all">
                               <Mail size={12} className="shrink-0" /> {contact.email}
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
                  <input type="checkbox" name="acceptPrivacy" checked={formData.acceptPrivacy} onChange={handleInputChange} className="mt-1 w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" />
                  <label className="text-sm text-slate-600">
                    Acepto la política de privacidad y el tratamiento de mis datos para la gestión de la visita.
                  </label>
                </div>
                {formError && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl font-semibold text-sm flex items-center gap-2"><AlertCircle size={18} /> {formError}</div>}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-3 bg-white border border-slate-200 px-5 py-3 rounded-xl w-full md:w-auto">
                    <label className="text-sm font-bold text-slate-500 uppercase">Asistentes:</label>
                    <select name="attendeesCount" value={formData.attendeesCount} onChange={handleInputChange} className="bg-transparent border-none font-extrabold text-slate-900 focus:ring-0 text-lg outline-none cursor-pointer">
                      {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <button type="submit" disabled={loading} className="w-full md:w-auto bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-10 py-4 rounded-xl font-bold shadow-xl hover:shadow-indigo-200 transition-all hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0">
                    {loading ? 'Procesando...' : 'Confirmar Reserva'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </main>
      )}

      {view === 'success' && (
        <main className="max-w-xl mx-auto px-4 py-24 text-center animate-fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-12 border border-slate-100">
            <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
            <h2 className="text-4xl font-extrabold text-slate-900 mb-4">¡Reserva Confirmada!</h2>
            <p className="text-slate-500 mb-8">Gracias <strong>{formData.parentName}</strong>.</p>
            <div className="bg-slate-50 rounded-2xl p-8 text-left mb-8 border border-slate-100 relative">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between border-b border-slate-200 pb-3">
                  <span className="text-slate-500">Día</span>
                  <span className="font-bold text-slate-900">{formData.selectedDate}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-3">
                  <span className="text-slate-500">Hora</span>
                  <span className="font-bold text-indigo-700">{formData.selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Futuro/a alumno/a</span>
                  <span className="font-bold text-slate-900">{formData.childName}</span>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl mb-8 border border-blue-100 text-sm">
              <p className="mb-2"><strong>Nota importante:</strong> Te enviaremos un recordatorio unos días antes de la visita.</p>
              {formData.selectedDate === 'Visita Individual' && (
                <p className="mt-2 text-indigo-800 font-bold">Nos pondremos en contacto contigo en breve para fijar la fecha.</p>
              )}
            </div>
            <div className="flex flex-col gap-4">
              {formData.selectedDate !== 'Visita Individual' && (
                <button onClick={addToGoogleCalendar} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg">
                  <CalendarPlus size={20} /> Añadir a Google Calendar
                </button>
              )}
              <button onClick={() => { setFormData({ parentName: '', email: '', phone: '', childName: '', childAge: '', interestedGrade: '', selectedDate: '', selectedTime: '', attendeesCount: 1, acceptPrivacy: false }); setView('landing'); }} className="px-8 py-4 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-colors">
                Volver al Inicio
              </button>
            </div>
          </div>
        </main>
      )}

      {view === 'adminLogin' && (
        <main className="max-w-md mx-auto px-4 py-20 animate-fade-in">
          <div className="bg-white p-10 rounded-[2rem] shadow-2xl border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Acceso Centro</h2>
            <form onSubmit={handleAdminLogin}>
              <input type="password" value={adminPassInput} onChange={(e) => setAdminPassInput(e.target.value)} className="w-full border border-slate-300 rounded-xl p-4 mb-6 text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Contraseña de administrador" />
              <div className="flex gap-3">
                <button type="button" onClick={() => setView('landing')} className="w-1/2 py-3 bg-slate-100 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors">Cancelar</button>
                <button type="submit" className="w-1/2 py-3 bg-indigo-900 text-white font-bold rounded-xl hover:bg-indigo-800 transition-colors">Entrar</button>
              </div>
            </form>
          </div>
        </main>
      )}

      {view === 'admin' && (
        <main className="max-w-7xl mx-auto px-6 py-8 animate-fade-in">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900">Panel de Control</h2>
            <div className="flex gap-3">
              <button onClick={copyToClipboard} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 shadow-sm">
                <ClipboardCopy size={18} /> Copiar para Excel
              </button>
              <button onClick={exportToCSV} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 shadow-sm">
                <Download size={18} /> Descargar CSV
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Settings size={20} /> Gestión de Fechas</h3>
            <form onSubmit={handleAddSlot} className="flex flex-wrap gap-4 mb-6 items-end">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Fecha</label>
                <input type="date" value={newSlotDate} onChange={(e) => setNewSlotDate(e.target.value)} className="border p-2 rounded bg-white text-slate-900" required />
              </div>
              <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1">Hora</label>
                 <input type="time" value={newSlotTime} onChange={(e) => setNewSlotTime(e.target.value)} className="border p-2 rounded bg-white text-slate-900" required />
              </div>
              <div className="flex-1 min-w-[200px]">
                 <label className="block text-xs font-bold text-slate-500 mb-1">Etiqueta</label>
                 <input type="text" value={newSlotLabel} onChange={(e) => setNewSlotLabel(e.target.value)} placeholder="Ej: Lunes 20 de Marzo" className="border p-2 rounded bg-white text-slate-900 w-full" required />
              </div>
              <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1">Grupo</label>
                 <select value={newSlotGroup} onChange={(e) => setNewSlotGroup(e.target.value)} className="border p-2 rounded bg-white text-slate-900">
                  <option value="EI_EP">Infantil/Primaria</option>
                  <option value="ESO">Secundaria</option>
                </select>
              </div>
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded shadow flex items-center justify-center transition-colors"><PlusCircle size={20} /></button>
            </form>
            <div className="grid gap-4 md:grid-cols-3">
              {displaySlots.map((slot) => (
                <div key={slot.id} className={`p-4 border rounded-xl flex justify-between items-center transition-colors ${String(slot.id).startsWith('def_') || String(slot.id).startsWith('eso_') ? 'bg-slate-50' : 'bg-white border-blue-200'}`}>
                  <div>
                    <div className="font-bold text-slate-800">{slot.label}</div>
                    <div className="text-xs text-slate-500 flex gap-2">
                       <span>{slot.times.join(', ')}</span>
                       <span className="font-mono bg-slate-200 px-1 rounded">{slot.group}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => toggleSlotStatus(slot.id, slotStatus[slot.id])} className={`${slotStatus[slot.id] === false ? 'text-red-500 bg-red-50' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'} p-2 rounded transition-colors`} title={slotStatus[slot.id] === false ? 'Abrir fecha' : 'Cerrar fecha'}>
                      {slotStatus[slot.id] === false ? <Ban size={18} /> : <Lock size={18} />}
                    </button>
                    {!String(slot.id).startsWith('def_') && !String(slot.id).startsWith('eso_') && (
                      <button onClick={() => handleDeleteSlot(slot.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded transition-colors" title="Eliminar fecha">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <h3 className="font-bold text-lg">Registros ({filteredRegistrations.length})</h3>
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input type="text" placeholder="Buscar familia..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64" />
               </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500 font-bold tracking-wider">
                  <tr>
                    <th className="p-4">Fecha Visita</th>
                    <th className="p-4">Familia</th>
                    <th className="p-4">Alumno/a</th>
                    <th className="p-4 text-center">Curso</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-indigo-900">{reg.selectedDate}</div>
                        <div className="text-xs text-indigo-600 bg-indigo-50 inline-block px-2 py-0.5 rounded mt-1">{reg.selectedTime}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-slate-900">{reg.parentName}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Phone size={10} /> {reg.phone}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1"><Mail size={10} /> {reg.email}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-slate-900">{reg.childName}</div>
                        <div className="text-xs text-slate-500">Año: {reg.childAge}</div>
                      </td>
                       <td className="p-4 text-center">
                        <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{reg.interestedGrade}</span>
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDeleteClick(reg.id)} className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded transition-colors" title="Eliminar registro">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredRegistrations.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500 italic">No se encontraron registros.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900 mt-auto">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 text-sm">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white p-2 rounded-lg">
                <img src={LOGO_URL} alt="Logo" className="h-8 w-auto" />
              </div>
              <h4 className="text-white font-bold text-xl">Colegio San Buenaventura</h4>
            </div>
            <p className="mb-4 leading-relaxed max-w-sm text-slate-300">
              Somos referente educativo en la zona. Excelencia académica y valores franciscanos.
            </p>
            <div className="flex gap-4">
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-white/20 text-white transition-colors"><Instagram size={20} /></a>
              <a href={`mailto:${DEFAULT_CONTACT_EMAIL}`} className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-white/20 text-white transition-colors"><Mail size={20} /></a>
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-white/20 text-white transition-colors"><Globe size={20} /></a>
            </div>
          </div>
          <div className="col-span-2">
            <h4 className="text-white font-bold text-lg mb-6">Ubicación</h4>
            <div className="space-y-4">
              <p className="flex items-start gap-3">
                <MapPin size={18} className="text-indigo-500 shrink-0 mt-0.5" /> 
                <span>C/ de El Greco 16<br />28011, Madrid<br />(Distrito Latina)</span>
              </p>
              <div className="mt-4">
                <button onClick={() => window.open('https://www.google.com/maps/dir/?api=1&destination=Colegio+San+Buenaventura+Madrid', '_blank')} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-500 transition-colors shadow-lg">
                  <Navigation size={18} /> Cómo llegar
                </button>
              </div>
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
