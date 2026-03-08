export interface Employee {
  name: string;
  email: string;
  title: string;
  role: 'Admin' | 'Read-Only';
  dob?: string;
}

export interface DocumentCategory {
  id: string;
  name: string;
  documents: string[];
}

export interface Document {
  id: string;
  title: string;
  type: string;
  holder: string;
  expiryDate: string;
  department: string;
  hasAttachment?: boolean;
  attachmentName?: string;
  attachmentUrl?: string;
}

export interface Office {
  name: string;
  location: string;
  type: 'Main' | 'Branch';
}

export const initialOffices: Office[] = [
  { name: 'ABS MIDEAST Dammam', location: 'Dammam, KSA', type: 'Main' },
  { name: 'ABS MIDEAST Jeddah', location: 'Jeddah, KSA', type: 'Branch' }
];

export const employees: Employee[] = [
  { name: "Mohamed Naguib", email: "mnaguib@eagle.org", title: "Surveyor III, Senior", role: "Admin" },
  { name: "Ahmed Abdelnabi", email: "aabdelnabi@eagle.org", title: "Surveyor In Charge, Principal", role: "Admin" },
  { name: "Hussain Julaih", email: "HJulaih@eagle.org", title: "Administrative Assistant, Senior", role: "Admin" },
  { name: "Mohammad Latif", email: "mlatif@eagle.org", title: "Coordinator, Administrative", role: "Admin" },
  { name: "Yousef Alyaquob", email: "YAliAlyaquob@eagle.org", title: "Administrative Assistant II", role: "Admin" },
  { name: "Abdel Raouf Hefny", email: "ahefny@eagle.org", title: "Surveyor III, Senior", role: "Read-Only" },
  { name: "Abdulaziz Alklabi", email: "AAlklabi@eagle.org", title: "Surveyor II", role: "Read-Only" },
  { name: "Abdulelah Naytah", email: "ANaytah@eagle.org", title: "Surveyor II", role: "Read-Only" },
  { name: "Abdullah Haider", email: "AHaider@eagle.org", title: "Surveyor I", role: "Read-Only" },
  { name: "Ahmed Alsaggaf", email: "AAlsaggaf@eagle.org", title: "Surveyor I", role: "Read-Only" },
  { name: "Akinola Isaac", email: "ABamidele@eagle.org", title: "Surveyor III, Senior", role: "Read-Only" },
  { name: "Ali Alsalem", email: "AAlsalem@eagle.org", title: "Surveyor II", role: "Read-Only" },
  { name: "Amir Elsayed", email: "AmIbrahim@eagle.org", title: "Engineer, Principal", role: "Read-Only" },
  { name: "Ayman Ali", email: "AymanAli@eagle.org", title: "Surveyor I, Senior", role: "Read-Only" },
  { name: "Biju Thomas", email: "bijthomas@eagle.org", title: "Surveyor I, Senior", role: "Read-Only" },
  { name: "DS Kim", email: "dskim@eagle.org", title: "Surveyor, Assistant Principal", role: "Read-Only" },
  { name: "Haitham Arif", email: "harif@eagle.org", title: "Surveyor, Assistant Principal", role: "Read-Only" },
  { name: "Hamdy Rakha", email: "hrakha@eagle.org", title: "Manager, Business Development", role: "Read-Only" },
  { name: "Hatem Alsagheer", email: "HALSagheer@eagle.org", title: "Surveyor I, Senior", role: "Read-Only" },
  { name: "Hattan Sarwalah", email: "HSarwalah@eagle.org", title: "Surveyor I", role: "Read-Only" },
  { name: "Hosam Aboulnour", email: "haboulnour@eagle.org", title: "Surveyor III, Senior", role: "Read-Only" },
  { name: "Hussain Al Mahdi", email: "HAlMahdi@eagle.org", title: "Manager, Technology", role: "Read-Only" },
  { name: "Hussain Alabbas", email: "HAlAbbas@eagle.org", title: "Surveyor I", role: "Read-Only" },
  { name: "Jaffar Aldahhan", email: "JAldahhan@eagle.org", title: "Engineer II, Sustainability", role: "Read-Only" },
  { name: "Mahmoud Elshal", email: "MElshal@eagle.org", title: "Surveyor III, Senior", role: "Read-Only" },
  { name: "Moetaz Khalifa", email: "mkhalifa@eagle.org", title: "Auditor, Principal", role: "Read-Only" },
  { name: "Mohammed Albasri", email: "almohammed@eagle.org", title: "Surveyor I, Senior", role: "Read-Only" },
  { name: "Mohammed Alqurish", email: "MAlqurish@eagle.org", title: "Surveyor II", role: "Read-Only" },
  { name: "Mohammed Hamzi", email: "MHamzi@eagle.org", title: "Surveyor I", role: "Read-Only" },
  { name: "Muhammad Ikram", email: "MIkram@eagle.org", title: "Surveyor II, Senior", role: "Read-Only" },
  { name: "Oy-Hoy Joo", email: "ojoo@eagle.org", title: "Surveyor, Principal", role: "Read-Only" },
  { name: "Samir Souiai", email: "ssouiai@eagle.org", title: "Manager, Area Operations", role: "Read-Only" },
  { name: "Shabad Valiyarambath", email: "vshabad@eagle.org", title: "Engineer, Managing Principal", role: "Read-Only" },
  { name: "Tanweer Ahmed", email: "TAhmed@eagle.org", title: "Surveyor II, Senior", role: "Read-Only" },
  { name: "Wala Alduhaim", email: "WAlduhaim@eagle.org", title: "Surveyor I", role: "Read-Only" },
  { name: "Zainab Huwaidi", email: "ZHuwaidi@eagle.org", title: "Administrative Assistant I", role: "Read-Only" }
];

export const documentCategories: DocumentCategory[] = [
  {
    id: "cat_office",
    name: "Office Documents",
    documents: [
      "Company CR", "Chamber of Commerce", "SAGIA", "GOSI", "Saudization Certificate",
      "Local Content Certificate", "Municipality", "Civil Defense", "VAT Certificate",
      "ZAKAT Certificate", "National Address Certificate", "JADEER 01", "JADEER 02",
      "TGA Activity License", "ISO-14001", "ISO-45001", "ISO-9001", "CCTV Contract",
      "Extinguisher Service", "Office Contract"
    ]
  },
  {
    id: "cat_employee",
    name: "Employee Documents",
    documents: [
      "Passport", "Iqama", "National Id", "Driving License", "Car Authorization (TAMM)",
      "Exit-Entry", "Surveyor Card", "ARAMCO Id", "ARAMCO Car Sticker", "HUET/BOSIET",
      "H2S Card", "Lifejacket Service", "Gas Meter Service", "Annual Medical", "Muqeem Report"
    ]
  },
  {
    id: "cat_port_passes",
    name: "Port Passes",
    documents: [
      "Dammam Port - Personnel", "Dammam Port - Car", "Juaymah/Ras Tanura Port - Personnel",
      "Ras Tanura Port - Car", "Jubail Commercial Port - Personnel", "Jubail Commercial Port - Car",
      "Jubail Industrial Port - Personnel", "Jubail Industrial Port - Car", "Ras Alkhair Port - Personnel",
      "Ras Alkhair Port - Car", "King Salman Port - Personnel", "King Salman Port - Car",
      "Khafji/Safaniya/Tanajib - Personnel", "Khafji/Safaniya/Tanajib - Car", "Jeddah Islamic Port - Personnel",
      "Jeddah Islamic Port - Car", "Rabigh/King Abdullah Port - Personnel", "Rabigh/King Abdullah Port - Car",
      "ARAMCO Terminal Jeddah - Personnel", "ARAMCO Terminal Jeddah - Car"
    ]
  }
];

export const mockDocuments: Document[] = [
  { id: 'DOC-1001', title: 'Company CR', type: 'Office Documents', holder: 'ABS MIDEAST Dammam', expiryDate: '2026-01-15', department: 'Office', hasAttachment: true },
  { id: 'DOC-1002', title: 'GOSI', type: 'Office Documents', holder: 'ABS MIDEAST Dammam', expiryDate: '2026-03-10', department: 'Office', hasAttachment: false },
  { id: 'DOC-1007', title: 'Civil Defense', type: 'Office Documents', holder: 'ABS MIDEAST Jeddah', expiryDate: '2026-02-15', department: 'Office', hasAttachment: true },
  { id: 'DOC-1008', title: 'TGA Activity License', type: 'Office Documents', holder: 'ABS MIDEAST Jeddah', expiryDate: '2026-05-20', department: 'Office', hasAttachment: false },
  { id: 'DOC-1003', title: 'Passport', type: 'Employee Documents', holder: 'Mohamed Naguib', expiryDate: '2026-04-15', department: 'Surveyor III, Senior', hasAttachment: true },
  { id: 'DOC-1004', title: 'Iqama', type: 'Employee Documents', holder: 'Ahmed Abdelnabi', expiryDate: '2028-08-05', department: 'Surveyor In Charge, Principal', hasAttachment: true },
  { id: 'DOC-1005', title: 'Dammam Port - Personnel', type: 'Port Passes', holder: 'Abdel Raouf Hefny', expiryDate: '2026-11-12', department: 'Surveyor III, Senior', hasAttachment: false },
  { id: 'DOC-1006', title: 'HUET/BOSIET', type: 'Employee Documents', holder: 'Abdulaziz Alklabi', expiryDate: '2026-02-25', department: 'Surveyor II', hasAttachment: true },
  { id: 'DOC-1016', title: 'H2S Card', type: 'Employee Documents', holder: 'Abdulelah Naytah', expiryDate: '2027-05-18', department: 'Surveyor II', hasAttachment: false },
  { id: 'DOC-1017', title: 'ZAKAT Certificate', type: 'Office Documents', holder: 'ABS Mideast Ltd', expiryDate: 'No Expiry', department: 'Office', hasAttachment: true },
  { id: 'DOC-1009', title: 'ARAMCO Id', type: 'Employee Documents', holder: 'Abdullah Haider', expiryDate: '2026-09-30', department: 'Surveyor I', hasAttachment: false },
  { id: 'DOC-1010', title: 'Jubail Commercial Port - Car', type: 'Port Passes', holder: 'Ahmed Alsaggaf', expiryDate: '2026-04-05', department: 'Surveyor I', hasAttachment: true },
  { id: 'DOC-1011', title: 'Saudization Certificate', type: 'Office Documents', holder: 'ABS Mideast Ltd', expiryDate: '2026-02-20', department: 'Office', hasAttachment: false },
  { id: 'DOC-1012', title: 'Annual Medical', type: 'Employee Documents', holder: 'Akinola Isaac', expiryDate: '2026-03-01', department: 'Surveyor III, Senior', hasAttachment: true },
  { id: 'DOC-1013', title: 'King Salman Port - Personnel', type: 'Port Passes', holder: 'Ali Alsalem', expiryDate: '2026-03-15', department: 'Surveyor II', hasAttachment: false },
  { id: 'DOC-1014', title: 'ISO-9001', type: 'Office Documents', holder: 'ABS Mideast Ltd', expiryDate: '2026-01-01', department: 'Office', hasAttachment: true },
  { id: 'DOC-1015', title: 'Driving License', type: 'Employee Documents', holder: 'Amir Elsayed', expiryDate: '2026-06-10', department: 'Engineer, Principal', hasAttachment: false },
];

export const statsHistory = {
  expired: [4, 5, 3, 6, 4, 3, 5],
  expiring: [8, 12, 10, 15, 12, 14, 11],
  valid: [85, 82, 88, 86, 90, 92, 94]
};
