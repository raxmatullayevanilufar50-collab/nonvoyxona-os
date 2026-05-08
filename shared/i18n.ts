/**
 * Uzbek (Latin) localization strings for Nonvoyxona OS
 * All UI text in Uzbek language
 */

export const uz = {
  // Common
  common: {
    save: "Saqlash",
    cancel: "Bekor qilish",
    delete: "O'chirish",
    edit: "Tahrirlash",
    add: "Qo'shish",
    back: "Orqaga",
    next: "Keyingi",
    previous: "Oldingi",
    search: "Qidirish",
    filter: "Filtrlash",
    export: "Eksport qilish",
    import: "Import qilish",
    download: "Yuklab olish",
    upload: "Yuklash",
    loading: "Yuklanmoqda...",
    error: "Xato",
    success: "Muvaffaqiyatli",
    warning: "Ogohlantirish",
    info: "Ma'lumot",
    yes: "Ha",
    no: "Yo'q",
    close: "Yopish",
    submit: "Yuborish",
    reset: "Qayta o'rnatish",
    clear: "Tozalash",
    confirm: "Tasdiqlash",
    logout: "Chiqish",
  },

  // Authentication
  auth: {
    login: "Kirish",
    logout: "Chiqish",
    register: "Ro'yxatdan o'tish",
    pinCode: "PIN kod",
    secretCode: "Maxfiy kod",
    phoneNumber: "Telefon raqami",
    name: "Ism",
    surname: "Familiya",
    enterPin: "PIN kodingizni kiriting",
    enterSecretCode: "Maxfiy kodingizni kiriting",
    invalidPin: "Noto'g'ri PIN kod",
    invalidSecretCode: "Noto'g'ri maxfiy kod",
    pinRequired: "PIN kod talab qilinadi",
    secretCodeRequired: "Maxfiy kod talab qilinadi",
    loginSuccess: "Muvaffaqiyatli kirildi",
    loginFailed: "Kirish muvaffaqiyatsiz bo'ldi",
    sessionExpired: "Sessiya tugadi",
    unauthorized: "Ruxsat yo'q",
    forbidden: "Kirish taqiqlangan",
    welcome: "Xush kelibsiz",
    selectRole: "Rolni tanlang",
  },

  // Roles
  roles: {
    owner: "Egasi",
    manager: "Menejер",
    cashier: "Kassir",
    driver: "Haydovchi",
  },

  // Dashboard
  dashboard: {
    title: "Bosh sahifa",
    overview: "Umumiy ko'rinish",
    todaySales: "Bugungi sotuvlar",
    todayExpenses: "Bugungi xarajatlar",
    todayProfit: "Bugungi foyda",
    totalDebt: "Jami qarz",
    lowStock: "Kam zaxira",
    pendingDeliveries: "Kutilmoqda bo'lgan yetkazuvlar",
    recentTransactions: "So'nggi tranzaksiyalar",
    charts: "Grafiklar",
    reports: "Hisobotlar",
  },

  // Sales Module
  sales: {
    title: "Sotuvlar",
    newSale: "Yangi sotish",
    salesList: "Sotuvlar ro'yxati",
    product: "Mahsulot",
    quantity: "Miqdor",
    price: "Narx",
    totalAmount: "Jami summa",
    paymentMethod: "To'lov usuli",
    cash: "Naqd pul",
    card: "Karta",
    debt: "Qarz",
    customer: "Xaridor",
    amountPaid: "To'langan summa",
    debtAmount: "Qarz miqdori",
    saleDate: "Sotish sanasi",
    notes: "Izohlar",
    addSale: "Sotish qo'shish",
    editSale: "Sotishni tahrirlash",
    deleteSale: "Sotishni o'chirish",
    saleCreated: "Sotish muvaffaqiyatli qo'shildi",
    saleUpdated: "Sotish muvaffaqiyatli yangilandi",
    saleDeleted: "Sotish muvaffaqiyatli o'chirildi",
  },

  // Production Module
  production: {
    title: "Ishlab chiqarish",
    newProduction: "Yangi ishlab chiqarish",
    productionList: "Ishlab chiqarish ro'yxati",
    product: "Mahsulot",
    quantity: "Miqdor",
    productionDate: "Ishlab chiqarish sanasi",
    addProduction: "Ishlab chiqarish qo'shish",
    editProduction: "Ishlab chiqarishni tahrirlash",
    deleteProduction: "Ishlab chiqarishni o'chirish",
    productionCreated: "Ishlab chiqarish muvaffaqiyatli qo'shildi",
    productionUpdated: "Ishlab chiqarish muvaffaqiyatli yangilandi",
    productionDeleted: "Ishlab chiqarish muvaffaqiyatli o'chirildi",
    linkedIngredients: "Bog'langan ingredientlar",
    consumptionTracking: "Iste'mol kuzatilishi",
  },

  // Ingredients Module
  ingredients: {
    title: "Ingredientlar",
    newIngredient: "Yangi ingredient",
    ingredientsList: "Ingredientlar ro'yxati",
    name: "Nomi",
    unit: "Birlik",
    currentStock: "Hozirgi zaxira",
    minStockLevel: "Minimal zaxira darajasi",
    unitCost: "Birlik narxi",
    supplier: "Yetkazib beruvchi",
    addIngredient: "Ingredient qo'shish",
    editIngredient: "Ingredientni tahrirlash",
    deleteIngredient: "Ingredientni o'chirish",
    ingredientCreated: "Ingredient muvaffaqiyatli qo'shildi",
    ingredientUpdated: "Ingredient muvaffaqiyatli yangilandi",
    ingredientDeleted: "Ingredient muvaffaqiyatli o'chirildi",
    purchases: "Xaridlar",
    newPurchase: "Yangi xarid",
    purchaseDate: "Xarid sanasi",
    quantity: "Miqdor",
    totalCost: "Jami xarajat",
    lowStockAlert: "Zaxira kam",
  },

  // Delivery Module
  delivery: {
    title: "Yetkazuvlar",
    newDelivery: "Yangi yetkazuv",
    deliveryList: "Yetkazuvlar ro'yxati",
    driver: "Haydovchi",
    deliveryDate: "Yetkazuv sanasi",
    status: "Holati",
    pending: "Kutilmoqda",
    inTransit: "Yo'lda",
    completed: "Tugallandi",
    returned: "Qaytarildi",
    totalQuantity: "Jami miqdor",
    returnedQuantity: "Qaytarilgan miqdor",
    addDelivery: "Yetkazuv qo'shish",
    editDelivery: "Yetkazuvni tahrirlash",
    deleteDelivery: "Yetkazuvni o'chirish",
    deliveryCreated: "Yetkazuv muvaffaqiyatli qo'shildi",
    deliveryUpdated: "Yetkazuv muvaffaqiyatli yangilandi",
    deliveryDeleted: "Yetkazuv muvaffaqiyatli o'chirildi",
    assignDriver: "Haydovchini tayinlash",
    trackDelivery: "Yetkazuvni kuzatish",
  },

  // Driver Settlement Module
  driverSettlement: {
    title: "Haydovchi hisob-kitoblari",
    settlements: "Hisob-kitoblar",
    newSettlement: "Yangi hisob-kitob",
    driver: "Haydovchi",
    settlementDate: "Hisob-kitob sanasi",
    totalEarnings: "Jami daromad",
    returnDeductions: "Qaytarish chegirmasi",
    advances: "Avanslar",
    netPayout: "Sof to'lov",
    status: "Holati",
    pending: "Kutilmoqda",
    paid: "To'landi",
    partial: "Qisman",
    createSettlement: "Hisob-kitob yaratish",
    editSettlement: "Hisob-kitobni tahrirlash",
    deleteSettlement: "Hisob-kitobni o'chirish",
    settlementCreated: "Hisob-kitob muvaffaqiyatli yaratildi",
    settlementUpdated: "Hisob-kitob muvaffaqiyatli yangilandi",
    settlementDeleted: "Hisob-kitob muvaffaqiyatli o'chirildi",
    dailySummary: "Kunlik xulasar",
    weeklySummary: "Haftalik xulasar",
  },

  // Expenses Module
  expenses: {
    title: "Xarajatlar",
    newExpense: "Yangi xarajat",
    expensesList: "Xarajatlar ro'yxati",
    category: "Kategoriya",
    amount: "Summa",
    description: "Tavsifi",
    expenseDate: "Xarajat sanasi",
    isPaid: "To'landi",
    dueDate: "To'lash muddati",
    addExpense: "Xarajat qo'shish",
    editExpense: "Xarajatni tahrirlash",
    deleteExpense: "Xarajatni o'chirish",
    expenseCreated: "Xarajat muvaffaqiyatli qo'shildi",
    expenseUpdated: "Xarajat muvaffaqiyatli yangilandi",
    expenseDeleted: "Xarajat muvaffaqiyatli o'chirildi",
    utilities: "Kommunal xizmatlar",
    rent: "Ijara",
    maintenance: "Ta'mirlash",
    fuel: "Yoqilg'i",
    other: "Boshqa",
  },

  // Salaries Module
  salaries: {
    title: "Oyliklar",
    newSalary: "Yangi oylik",
    salariesList: "Oyliklar ro'yxati",
    employee: "Xodim",
    month: "Oy",
    year: "Yil",
    baseSalary: "Asosiy oylik",
    advances: "Avanslar",
    deductions: "Chegirmalar",
    netSalary: "Sof oylik",
    isPaid: "To'landi",
    paidDate: "To'lash sanasi",
    paymentMethod: "To'lov usuli",
    cash: "Naqd pul",
    card: "Karta",
    transfer: "O'tkazma",
    addSalary: "Oylik qo'shish",
    editSalary: "Oylikni tahrirlash",
    deleteSalary: "Oylikni o'chirish",
    salaryCreated: "Oylik muvaffaqiyatli qo'shildi",
    salaryUpdated: "Oylik muvaffaqiyatli yangilandi",
    salaryDeleted: "Oylik muvaffaqiyatli o'chirildi",
    paymentHistory: "To'lov tarixi",
    employeeRecords: "Xodim yozuvlari",
  },

  // Customers & Debt Module
  customers: {
    title: "Xaridorlar",
    newCustomer: "Yangi xaridor",
    customersList: "Xaridorlar ro'yxati",
    name: "Nomi",
    phoneNumber: "Telefon raqami",
    address: "Manzil",
    totalDebt: "Jami qarz",
    debtHistory: "Qarz tarixi",
    addCustomer: "Xaridor qo'shish",
    editCustomer: "Xaridorni tahrirlash",
    deleteCustomer: "Xaridorni o'chirish",
    customerCreated: "Xaridor muvaffaqiyatli qo'shildi",
    customerUpdated: "Xaridor muvaffaqiyatli yangilandi",
    customerDeleted: "Xaridor muvaffaqiyatli o'chirildi",
    recordPayment: "To'lovni qayd etish",
    paymentAmount: "To'lov miqdori",
    paymentDate: "To'lov sanasi",
    paymentMethod: "To'lov usuli",
    paymentRecorded: "To'lov muvaffaqiyatli qayd etildi",
    debtBalance: "Qarz balansi",
    purchaseHistory: "Xarid tarixi",
  },

  // Reporting Module
  reports: {
    title: "Hisobotlar",
    dailyReport: "Kunlik hisobot",
    weeklyReport: "Haftalik hisobot",
    monthlyReport: "Oylik hisobot",
    yearlyReport: "Yillik hisobot",
    revenue: "Daromad",
    expenses: "Xarajatlar",
    profit: "Foyda",
    profitMargin: "Foyda foizi",
    productionSummary: "Ishlab chiqarish xulasar",
    debtSummary: "Qarz xulasar",
    exportPdf: "PDF sifatida eksport qilish",
    exportExcel: "Excel sifatida eksport qilish",
    dateRange: "Sana diapazoni",
    from: "Dan",
    to: "Gacha",
    generateReport: "Hisobot yaratish",
    reportGenerated: "Hisobot muvaffaqiyatli yaratildi",
    charts: "Grafiklar",
    revenueChart: "Daromad grafigi",
    expenseChart: "Xarajat grafigi",
    profitChart: "Foyda grafigi",
  },

  // User Management
  users: {
    title: "Foydalanuvchilar",
    newUser: "Yangi foydalanuvchi",
    usersList: "Foydalanuvchilar ro'yxati",
    name: "Ism",
    surname: "Familiya",
    email: "Email",
    phoneNumber: "Telefon raqami",
    role: "Rol",
    pinCode: "PIN kod",
    isActive: "Faol",
    addUser: "Foydalanuvchi qo'shish",
    editUser: "Foydalanuvchini tahrirlash",
    deleteUser: "Foydalanuvchini o'chirish",
    userCreated: "Foydalanuvchi muvaffaqiyatli qo'shildi",
    userUpdated: "Foydalanuvchi muvaffaqiyatli yangilandi",
    userDeleted: "Foydalanuvchi muvaffaqiyatli o'chirildi",
    changePinCode: "PIN kodini o'zgartirish",
    deactivateUser: "Foydalanuvchini faolsizlashtirish",
    activateUser: "Foydalanuvchini faollashtirish",
  },

  // Settings
  settings: {
    title: "Sozlamalar",
    general: "Umumiy",
    security: "Xavfsizlik",
    ownerSecretCode: "Egasi maxfiy kodi",
    setSecretCode: "Maxfiy kodni o'rnatish",
    changeSecretCode: "Maxfiy kodini o'zgartirish",
    currentSecretCode: "Hozirgi maxfiy kod",
    newSecretCode: "Yangi maxfiy kod",
    confirmSecretCode: "Maxfiy kodini tasdiqlash",
    secretCodeUpdated: "Maxfiy kod muvaffaqiyatli yangilandi",
    businessInfo: "Biznes ma'lumoti",
    businessName: "Biznes nomi",
    businessAddress: "Biznes manzili",
    businessPhone: "Biznes telefoni",
    businessEmail: "Biznes emaili",
  },

  // Error Messages
  errors: {
    required: "Majburiy maydon",
    invalidEmail: "Noto'g'ri email",
    invalidPhone: "Noto'g'ri telefon raqami",
    invalidPin: "PIN kod 4-6 raqamdan iborat bo'lishi kerak",
    passwordMismatch: "Parollar mos kelmadi",
    userNotFound: "Foydalanuvchi topilmadi",
    productNotFound: "Mahsulot topilmadi",
    customerNotFound: "Xaridor topilmadi",
    ingredientNotFound: "Ingredient topilmadi",
    insufficientStock: "Yetarli zaxira yo'q",
    operationFailed: "Operatsiya muvaffaqiyatsiz bo'ldi",
    unauthorized: "Ruxsat yo'q",
    forbidden: "Kirish taqiqlangan",
    serverError: "Server xatosi",
    networkError: "Tarmoq xatosi",
    sessionExpired: "Sessiya tugadi",
  },

  // Success Messages
  success: {
    operationCompleted: "Operatsiya muvaffaqiyatli tugallandi",
    dataSaved: "Ma'lumot muvaffaqiyatli saqlandi",
    dataDeleted: "Ma'lumot muvaffaqiyatli o'chirildi",
    dataUpdated: "Ma'lumot muvaffaqiyatli yangilandi",
  },

  // Validation Messages
  validation: {
    fieldRequired: "Bu maydon talab qilinadi",
    minLength: "Minimal uzunlik: {min} belgi",
    maxLength: "Maksimal uzunlik: {max} belgi",
    invalidFormat: "Noto'g'ri format",
    mustBeNumber: "Raqam bo'lishi kerak",
    mustBePositive: "Musbat raqam bo'lishi kerak",
  },

  // Months
  months: {
    january: "Yanvar",
    february: "Fevral",
    march: "Mart",
    april: "Aprel",
    may: "May",
    june: "Iyun",
    july: "Iyul",
    august: "Avgust",
    september: "Sentabr",
    october: "Oktabr",
    november: "Noyabr",
    december: "Dekabr",
  },

  // Days
  days: {
    monday: "Dushanba",
    tuesday: "Seshanba",
    wednesday: "Chorshanba",
    thursday: "Payshanba",
    friday: "Juma",
    saturday: "Shanba",
    sunday: "Yakshanba",
  },
};

// Type-safe translation function
export function t(key: string, params?: Record<string, string | number>): string {
  const keys = key.split(".");
  let value: any = uz;

  for (const k of keys) {
    value = value?.[k];
    if (!value) return key; // Return key if translation not found
  }

  if (typeof value !== "string") return key;

  // Replace parameters
  if (params) {
    return Object.entries(params).reduce(
      (str, [key, val]) => str.replace(`{${key}}`, String(val)),
      value
    );
  }

  return value;
}

export default uz;
