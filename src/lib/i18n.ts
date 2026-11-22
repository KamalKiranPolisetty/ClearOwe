export type Language = 'en';

export const translations = {
  en: {
    // App Brand
    appName: 'ClearOwe',
    appTagline: 'Personal loan and debt tracker',

    // Navigation
    navHome: 'Home',
    navThisMonth: 'This Month',
    navLoans: 'Loans',
    navPayOrder: 'Pay Order',
    navSettings: 'Settings',

    // Statuses
    statusPaid: 'Paid',
    statusUnpaid: 'Unpaid',
    statusPartiallyPaid: 'Partially Paid',
    statusOverdue: 'Overdue',
    statusDueSoon: 'Due Soon',

    // Dashboard
    totalOwed: 'Total Owed',
    interestDueThisMonth: 'Interest Due This Month',
    totalOverdue: 'Total Overdue',
    loansSummary: 'Loans Paid vs Unpaid',
    paidOfTotal: '{paid} of {total} paid',
    principalRepaidProgress: 'Principal Repaid Progress',
    repaid: 'repaid',
    remaining: 'remaining',
    quickAlertTitle: 'Upcoming & Overdue Payments',
    noAlerts: 'All payments are currently on track!',
    viewDues: 'View Dues',
    chartsTitle: 'Repayment Overview',
    principalOverTime: 'Total Principal Remaining',
    interestPaidPerMonth: 'Interest Paid Per Month',
    allCurrenciesCombined: 'Combined View',
    exchangeRateNote: 'Using rate: 1 USD = ₹{rate}',

    // This Month
    thisMonthTitle: 'This Month\'s Dues',
    thisMonthSubtitle: 'Tap "Mark as Paid" when you give money to a lender',
    markAsPaid: 'Mark as Paid',
    dueOn: 'Due on',
    interestAmount: 'Interest',
    overdueAmount: 'Overdue',
    totalDue: 'Total Due',
    allPaidMessage: 'Wonderful! All interest for this month has been paid.',

    // Loans Screen
    activeLoans: 'Active Loans',
    archivedLoans: 'Archived Loans',
    addNewLoan: '+ Add New Loan',
    noLoansYet: 'No loans added yet. Tap "+ Add New Loan" or load sample loans to get started.',
    loadSampleDataBtn: 'Load Sample Loans',
    lenderName: 'Lender Name',
    lenderType: 'Lender Type',
    originalLoan: 'Original Loan',
    currentBalance: 'Current Balance',
    interestRule: 'Interest Rule',
    overdueRuleLabel: 'Overdue Rule',
    editLoan: 'Edit Loan',
    archiveLoan: 'Archive',
    unarchiveLoan: 'Unarchive',
    deleteLoan: 'Delete',
    viewHistory: 'View Payments & History',
    confirmDeleteLoan: 'Are you sure you want to delete this loan? All payment history will also be removed.',
    undo: 'Undo',

    // Add / Edit Loan Modal
    modalAddLoanTitle: 'Add a Borrowed Loan',
    modalEditLoanTitle: 'Edit Loan Details',
    lenderNamePlaceholder: 'e.g. Personal Loan, State Bank, Equipment Loan',
    currencyLabel: 'Currency',
    amountLabel: 'Amount Borrowed',
    interestTypeLabel: 'How is interest calculated?',
    interestRateLabel: 'Interest Rate',
    rateMonthlyHelp: 'Percentage charged every month on remaining balance',
    rateYearlyHelp: 'Percentage charged per year (divided across 12 months)',
    rateFixedHelp: 'Fixed money amount given every month',
    rateZeroHelp: 'Zero interest (friendly loan)',
    startDateLabel: 'Loan Start Date',
    dueDayLabel: 'Interest Due Day of Month',
    dueDayHelp: 'e.g. 5 means 5th of every month',
    overdueRuleHelp: 'What happens if interest is not paid on time?',
    ruleCarryForward: 'Carry forward as overdue (Default)',
    ruleCarryForwardHelp: 'Unpaid interest waits as overdue. Next month interest stays on original principal.',
    ruleCompound: 'Add to principal (Compound)',
    ruleCompoundHelp: 'Unpaid interest gets added to principal. Next month you pay interest on interest.',
    priorityLabel: 'Priority',
    notesLabel: 'Notes (optional)',
    saveLoan: 'Save Loan',
    cancel: 'Cancel',

    // Lender Types
    lenderBank: 'Bank',
    lenderRelative: 'Relative',
    lenderFriend: 'Friend',
    lenderPrivate: 'Private Lender',
    lenderOther: 'Other',

    // Interest Types
    typeMonthly: '% Per Month',
    typeYearly: '% Per Year',
    typeFixed: 'Fixed Monthly Amount',
    typeZero: 'No Interest (0%)',

    // Priority Levels
    priorityTop: 'Top Priority',
    priorityHigh: 'High',
    priorityMedium: 'Medium',
    priorityLow: 'Low',

    // Payment Modal
    recordPaymentTitle: 'Record a Payment',
    amountPaidLabel: 'Amount Paid',
    paymentDateLabel: 'Date Paid',
    destinationLabel: 'Where does this payment go?',
    destInterest: 'Interest Only',
    destPrincipal: 'Principal Only',
    destSplit: 'Split (Recommended)',
    splitHelp: 'First clears overdue interest, then this month\'s interest, then reduces principal.',
    overdueCovered: 'Overdue interest paid',
    interestCovered: 'Current interest paid',
    principalCovered: 'Principal reduced by',
    paymentNotesLabel: 'Notes / Cheque # (optional)',
    savePayment: 'Save Payment',
    recordedBy: 'Logged by',

    // History Screen
    historyTitle: 'Payment History & Statement',
    editPayment: 'Edit Payment',
    deletePayment: 'Delete Payment',
    confirmDeletePayment: 'Are you sure you want to delete this payment? The loan balance will recalculate.',
    runningBalance: 'Balance Remaining',
    noPaymentsYet: 'No payments recorded yet for this loan.',

    // Pay Order Screen
    payOrderTitle: 'Repayment Order & Strategy',
    payOrderSubtitle: 'Pay high-interest loans first (Avalanche method) to save the maximum interest.',
    sortOptionLabel: 'Sort Strategy',
    sortAvalanche: 'Highest Interest Rate First (Recommended)',
    sortInterestAmount: 'Highest Monthly Interest First',
    sortLargestBalance: 'Largest Balance First',
    sortSmallestBalance: 'Smallest Balance First',
    sortMyPriority: 'My Custom Priority',
    avalancheTip: 'Tip: Paying the highest interest rate first saves the most money in the long run.',
    pinToTop: 'Pin to Top',
    unpin: 'Unpin',
    pinCostWarning: 'Note: Pinning this loan ahead of higher-interest loans will cost an estimated {cost} extra in interest.',
    budgetPlannerTitle: 'Monthly Repayment Planner',
    budgetPlannerSubtitle: 'Enter how much total money you can pay this month to see the best allocation.',
    monthlyBudgetInput: 'Monthly Budget for {currency}',
    calculatePlanBtn: 'Calculate Smart Plan',
    minimumNeeded: 'Minimum needed for all dues',
    surplusForPrincipal: 'Extra available for principal',
    budgetDeficitWarning: 'Warning: This budget is less than the minimum interest and overdue dues this month.',
    projectedPayoff: 'Projected payoff:',
    months: 'months',
    fullyPaid: 'Fully paid off!',

    // Settings Screen
    settingsTitle: 'Settings & Cloud Backup',
    languageLabel: 'Language',
    themeLabel: 'App Theme',
    themeLight: 'Light Mode',
    themeDark: 'Dark Mode',
    themeSystem: 'Match System',
    currencyAndRates: 'Currencies & Rates',
    exchangeRateLabel: 'USD to INR Exchange Rate',
    combinedCurrencyToggle: 'Show Combined Total on Dashboard',
    combinedTargetLabel: 'Show Combined Total in',
    householdTitle: 'Account & Workspace Sharing',
    householdDesc: 'Invite members by email so everyone sees the exact same updated records.',
    inviteMemberBtn: 'Invite Member',
    inviteEmailPlaceholder: 'Enter member email',
    householdRoleOwner: 'Owner',
    householdRoleMember: 'Member',
    offlineStatusOnline: 'Online & Synced with Supabase',
    offlineStatusOffline: 'Working Offline (Saved in Device Storage)',
    offlineStatusSyncing: 'Syncing changes to cloud...',
    syncNowBtn: 'Sync Now',
    notificationsTitle: 'Reminder Notifications',
    notificationsDesc: 'Get alerts before interest due dates so no payments are missed.',
    enableNotificationsBtn: 'Enable Reminders',
    testNotificationBtn: 'Test Alert',
    iosNote: 'iPhone Note: On iOS, please add ClearOwe to your Home Screen (Share -> Add to Home Screen) to enable push alerts.',
    dataBackupTitle: 'Data Backup & Reports',
    exportReportCsv: 'Export Loans & Payments (Excel / CSV)',
    exportBackupJson: 'Download Full JSON Backup',
    importBackupJson: 'Restore from JSON Backup',
    resetDataBtn: 'Clear All Local Data',
    confirmReset: 'Are you sure you want to reset all data? This cannot be undone unless you have a backup.',
    sqlSchemaGuide: 'Supabase SQL Setup Guide',

    // Onboarding
    onboardingTitle1: 'Welcome to ClearOwe',
    onboardingDesc1: 'Track all loans and borrowings in one safe, simple place — whether personal, bank, or private loans.',
    onboardingTitle2: 'Never Miss an Interest Date',
    onboardingDesc2: 'Every month shows exactly what is due. Tap one button to mark payments, and overdue amounts are highlighted clearly.',
    onboardingTitle3: 'Offline Ready & Cloud Sync',
    onboardingDesc3: 'Works everywhere even without internet. Securely backs up and syncs across devices when you connect.',
    next: 'Next',
    previous: 'Back',
    getStarted: 'Get Started with Fresh Data',
    loadSampleAndStart: 'Start with Sample Loans (Recommended)',
  },
};

export function getTranslation(
  lang: Language = 'en',
  key: keyof typeof translations['en'],
  params?: Record<string, string | number>
): string {
  let text = (translations[lang] && translations[lang][key]) || translations.en[key] || key;
  if (params) {
    Object.entries(params).forEach(([paramKey, value]) => {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(value));
    });
  }
  return text;
}

