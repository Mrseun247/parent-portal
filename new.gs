function doGet(e){
  const a=e.parameter.action;
  let r={success:false};

  try{
    // Authentication
    if(a=="signupAdmin") r=signupAdmin(e);
    if(a=="loginAdmin") r=loginAdmin(e);
    
    // Student Management
    if(a=="addStudent") r=addStudent(e);
    if(a=="getStudent") r=getStudent(e);
    if(a=="searchStudent") r=searchStudent(e);
    if(a=="updateStudent") r=updateStudent(e);
    
    // Term Management
    if(a=="addTerm") r=addTerm(e);
    if(a=="getTerms") r=getTerms(e);
    if(a=="updateTerm") r=updateTerm(e);
    if(a=="deleteTerm") r=deleteTerm(e);
    
    // Fee Management
    if(a=="addFee") r=addFee(e);
    if(a=="getFees") r=getFees(e);
    if(a=="getFee") r=getFee(e);
    if(a=="updateFee") r=updateFee(e);
    if(a=="deleteFee") r=deleteFee(e);
    if(a=="getFeeStructures") r=getFeeStructures(e);
    if(a=="updateFeeStructure") r=updateFeeStructure(e);
    if(a=="deleteFeeStructure") r=deleteFeeStructure(e);
    
    // Payment Management
    if(a=="addPayment") r=addPayment(e);
    if(a=="getStudentTermFees") r=getStudentTermFees(e);
    
    // Reporting
    if(a=="getReport") r=getReport(e);
    if(a=="generateFeeReceipt") r=generateFeeReceipt(e);
    
    // Admin Management
    if(a=="addAdmin") r=addAdmin(e);
    if(a=="getAdmins") r=getAdmins(e);
    if(a=="updateAdmin") r=updateAdmin(e);
    if(a=="updateAdminPassword") r=updateAdminPassword(e);
    if(a=="deleteAdmin") r=deleteAdmin(e);
    
    // Legacy support
    if(a=="getStudentFees") r=getStudentFees(e);
    if(a=="getStudentStatement") r=getStudentStatement(e);
    if(a=="getStudentAccount") r=getStudentAccount(e);
    
    // Test endpoint - simple test without spreadsheet
    if(a=="test") r={success:true, message:"Backend connected successfully", timestamp: new Date().toISOString()};
    
    // System statistics endpoint
    if(a=="getSystemStats") r=getSystemStats(e);
    
    // Fallback system stats - returns basic test data if main function fails
    if(a=="getSystemStatsBasic") r=getSystemStatsBasic(e);
    
    // Debug endpoint - get raw admin data
    if(a=="debugAdmins") r=debugAdmins(e);
    
    // Helper endpoint - list recent spreadsheets
    if(a=="listSpreadsheets") r=listRecentSpreadsheets(e);
    
    // Get spreadsheet info for debugging (only if spreadsheet exists)
    if(a=="getSpreadsheetInfo") r=getSpreadsheetInfo(e);
    
    // If no action matched, return error
    if(!r.success && r.success !== true) {
      r = {success: false, message: `Unknown action: ${a}`, availableActions: ['test', 'getSystemStats', 'loginAdmin', 'signupAdmin', 'addStudent', 'getStudent', 'searchStudent', 'addTerm', 'getTerms', 'addFee', 'addPayment', 'getReport', 'addAdmin', 'getAdmins']};
    }
    
  }catch(err){
    r={success:false,message:err.message};
  }

  return ContentService.createTextOutput(
    `${e.parameter.callback}(${JSON.stringify(r)})`
  ).setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// IMPORTANT: Replace this with your actual Spreadsheet ID
// To find your Spreadsheet ID:
// 1. Open your Google Sheet
// 2. Look at the URL: https://docs.google.com/spreadsheets/d/1T88t9Q1nRjyfnaTcUg6O9HudkOokOvDbmR3In1Ql5d8/edit?usp=sharing
// 3. Copy the ID between /d/ and /edit
// FIXED SPREADSHEET APPROACH - Use one specific spreadsheet
// Replace this ID with your actual spreadsheet ID to use your existing spreadsheet
// ⚠️ CRITICAL: Update this with your actual spreadsheet ID
// Instructions:
// 1. Go to sheets.google.com
// 2. Open your School Accounting System spreadsheet
// 3. Copy the ID from the URL (between /d/ and /edit)
// 4. Replace the ID below
const SPREADSHEET_ID = '1T88t9Q1nRjyfnaTcUg6O9HudkOokOvDbmR3In1Ql5d8'; // ⚠️ REPLACE THIS!

function ss(){ 
  try {
    // Always use the same spreadsheet by ID - no auto-creation
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // Ensure the Students sheet exists with proper headers
    ensureStudentsSheetStructure(spreadsheet);
    
    return spreadsheet;
  } catch (error) {
    // If the spreadsheet doesn't exist or can't be accessed, provide clear instructions
    throw new Error(`Cannot access spreadsheet with ID: ${SPREADSHEET_ID}. Please create a spreadsheet manually and update the SPREADSHEET_ID in the code. Error: ${error.message}`);
  }
}

function ensureStudentsSheetStructure(spreadsheet) {
  let studentsSheet;
  
  try {
    studentsSheet = spreadsheet.getSheetByName("Students");
  } catch (error) {
    // Sheet doesn't exist, create it
    studentsSheet = spreadsheet.insertSheet("Students");
  }
  
  // Check if headers exist
  const data = studentsSheet.getDataRange().getValues();
  if (data.length === 0 || !data[0] || data[0][0] !== 'ID') {
    // Add or fix headers
    const headers = ['ID', 'Name', 'Class', 'Gender', 'Parent Name', 'Parent Phone', 'Address', 'Status', 'Created Date'];
    studentsSheet.clear();
    studentsSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    console.log('Students sheet headers created/fixed');
  }
  
  // Also ensure Admins sheet exists and has test admin
  ensureAdminsSheetStructure(spreadsheet);
}

function ensureAdminsSheetStructure(spreadsheet) {
  let adminsSheet;
  
  try {
    adminsSheet = spreadsheet.getSheetByName("Admins");
  } catch (error) {
    // Sheet doesn't exist, create it
    adminsSheet = spreadsheet.insertSheet("Admins");
  }
  
  // Check if headers exist
  const data = adminsSheet.getDataRange().getValues();
  if (data.length === 0 || !data[0] || data[0][0] !== 'Email') {
    // Add headers
    const headers = ['Email', 'Password', 'Role', 'Full Name', 'Status', 'Created Date'];
    adminsSheet.clear();
    adminsSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    console.log('Admins sheet headers created');
  }
  
  // Check if test admin exists
  let testAdminExists = false;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === 'admin@school.com') {
      testAdminExists = true;
      break;
    }
  }
  
  // Create test admin if it doesn't exist
  if (!testAdminExists) {
    adminsSheet.appendRow([
      'admin@school.com',
      'admin123', 
      'super_admin',
      'Test Administrator',
      'active',
      new Date()
    ]);
    console.log('Test admin account created automatically');
  }
}

// This function is no longer used but kept for reference
function getOrCreateSpreadsheet() {
  try {
    // Always create a new spreadsheet to avoid ID issues
    const spreadsheet = SpreadsheetApp.create('School Accounting System Database - ' + new Date().toISOString().split('T')[0]);
    setupSpreadsheetSheets(spreadsheet);
    
    // Log the spreadsheet URL for user reference
    console.log('Created new spreadsheet:', spreadsheet.getUrl());
    
    return spreadsheet;
  } catch (error) {
    throw new Error(`Cannot create spreadsheet: ${error.message}`);
  }
}

function setupSpreadsheetSheets(spreadsheet) {
  // Remove default sheet
  const defaultSheet = spreadsheet.getSheets()[0];
  
  // Create required sheets with headers
  const sheetsConfig = {
    'Students': ['ID', 'Name', 'Class', 'Gender', 'Parent Name', 'Parent Phone', 'Address', 'Status', 'Created Date'],
    'Terms': ['ID', 'Name', 'Academic Year', 'Start Date', 'End Date', 'Status', 'Created Date'],
    'Fees': ['ID', 'Term ID', 'Class', 'Total', 'Fee Items JSON', 'Created Date'],
    'Payments': ['ID', 'Student ID', 'Term ID', 'Date', 'Amount', 'Payment Method', 'Reference', 'Notes', 'Receipt ID', 'Created Date'],
    'Admins': ['Email', 'Password', 'Role', 'Full Name', 'Status', 'Created Date']
  };
  
  Object.keys(sheetsConfig).forEach(sheetName => {
    const sheet = spreadsheet.insertSheet(sheetName);
    const headers = sheetsConfig[sheetName];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Add sample admin for testing
    if (sheetName === 'Admins') {
      sheet.getRange(2, 1, 1, 6).setValues([
        ['admin@school.com', 'admin123', 'super_admin', 'Test Administrator', 'active', new Date()]
      ]);
    }
  });
  
  // Delete default sheet
  if (defaultSheet.getName() !== 'Students') {
    spreadsheet.deleteSheet(defaultSheet);
  }
  
  console.log('Spreadsheet setup complete. ID:', spreadsheet.getId());
  return spreadsheet;
}

// Utility function to generate unique IDs
function generateId(prefix) {
  return prefix + "_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
}

// ==================== AUTHENTICATION ====================

function signupAdmin(e){
  const email = e.parameter.email;
  const password = e.parameter.password;
  const role = e.parameter.role || 'accountant';
  const fullName = e.parameter.fullName || email;
  
  console.log('Signup attempt:', {email, role, fullName});
  
  // Check if admin already exists
  const adminsSheet = ss().getSheetByName("Admins");
  const adminsData = adminsSheet.getDataRange().getValues();
  
  console.log('Current admin data before signup:', adminsData);
  
  for(let i = 1; i < adminsData.length; i++) {
    if(adminsData[i][0] === email) {
      console.log('Admin already exists:', adminsData[i]);
      return {success: false, message: "Admin already exists"};
    }
  }
  
  // Add new admin
  const newRow = [email, password, role, fullName, 'active', new Date()];
  console.log('Adding new admin row:', newRow);
  
  try {
    adminsSheet.appendRow(newRow);
    console.log('Admin row added successfully');
    
    // Verify the addition
    const updatedData = adminsSheet.getDataRange().getValues();
    console.log('Updated admin data after signup:', updatedData);
    
    return {success: true, message: "Admin account created successfully"};
  } catch (error) {
    console.error('Error adding admin row:', error);
    return {success: false, message: "Error creating admin account: " + error.message};
  }
}

function loginAdmin(e){
  const email = e.parameter.email;
  const password = e.parameter.password;
  const role = e.parameter.role;
  
  const adminsData = ss().getSheetByName("Admins").getDataRange().getValues();
  
  for(let i = 1; i < adminsData.length; i++) {
    if(adminsData[i][0] === email && 
       adminsData[i][1] === password && 
       adminsData[i][2] === role &&
       adminsData[i][4] === 'active') {
      return {
        success: true, 
        email: adminsData[i][0],
        role: adminsData[i][2],
        fullName: adminsData[i][3]
      };
    }
  }
  
  return {success: false, message: "Invalid login credentials or role"};
}

// ==================== STUDENT MANAGEMENT ====================

function addStudent(e){
  const sheet = ss().getSheetByName("Students");
  
  // Get all existing data to find the highest ID
  const data = sheet.getDataRange().getValues();
  let newId;
  
  console.log('Current student data:', data);
  console.log('Data length:', data.length);
  
  if (data.length <= 1) {
    // No students yet (only header row or empty sheet)
    newId = "VMCS0001";
    console.log('First student, assigning ID:', newId);
  } else {
    // Find the highest existing ID number
    let maxIdNumber = 0;
    
    for (let i = 1; i < data.length; i++) {
      const existingId = data[i][0];
      if (existingId && typeof existingId === 'string' && existingId.startsWith('VMCS')) {
        const idNumber = parseInt(existingId.substring(4), 10);
        if (!isNaN(idNumber) && idNumber > maxIdNumber) {
          maxIdNumber = idNumber;
        }
      }
    }
    
    const nextIdNumber = maxIdNumber + 1;
    newId = "VMCS" + ("0000" + nextIdNumber).slice(-4);
    console.log('Next ID number:', nextIdNumber, 'Generated ID:', newId);
  }
  
  // Add the new student
  const newRow = [
    newId, 
    e.parameter.name, 
    e.parameter.class, 
    e.parameter.gender, 
    e.parameter.parentName,
    e.parameter.parentPhone || '',
    e.parameter.address || '',
    'active',
    new Date()
  ];
  
  console.log('Adding new student row:', newRow);
  
  try {
    sheet.appendRow(newRow);
    console.log('Student added successfully with ID:', newId);
    
    // Verify the student was added
    const updatedData = sheet.getDataRange().getValues();
    console.log('Updated student data after addition:', updatedData);
    
    return {success: true, studentID: newId, message: "Student registered successfully"};
  } catch (error) {
    console.error('Error adding student:', error);
    return {success: false, message: "Error registering student: " + error.message};
  }
}

function getStudent(e) {
  const studentID = e.parameter.studentID;
  const studentsData = ss().getSheetByName("Students").getDataRange().getValues();
  
  for(let i = 1; i < studentsData.length; i++) {
    if(studentsData[i][0] === studentID) {
      return {
        success: true,
        student: {
          id: studentsData[i][0],
          name: studentsData[i][1],
          class: studentsData[i][2],
          gender: studentsData[i][3],
          parentName: studentsData[i][4],
          parentPhone: studentsData[i][5] || '',
          address: studentsData[i][6] || '',
          status: studentsData[i][7] || 'active'
        }
      };
    }
  }
  
  return {success: false, message: "Student not found"};
}

function searchStudent(e){
  const q = e.parameter.query.toLowerCase();
  console.log('Search query:', q);
  
  const data = ss().getSheetByName("Students").getDataRange().getValues();
  console.log('Student data for search:', data);
  console.log('Total rows:', data.length);
  
  if (data.length <= 1) {
    console.log('No student data found (only headers or empty)');
    return {success: true, students: [], message: "No students in database"};
  }
  
  const students = data.slice(1)
    .filter(row => {
      const rowText = row.join(" ").toLowerCase();
      const matches = rowText.includes(q);
      console.log('Row:', row[0], row[1], 'Text:', rowText, 'Matches:', matches);
      return matches;
    })
    .map(row => ({
      id: row[0],
      name: row[1],
      class: row[2],
      gender: row[3],
      parentName: row[4],
      parentPhone: row[5] || '',
      address: row[6] || ''
    }));
  
  console.log('Search results:', students);
  return {success: true, students: students};
}

function updateStudent(e) {
  const studentID = e.parameter.studentID;
  const sheet = ss().getSheetByName("Students");
  const data = sheet.getDataRange().getValues();
  
  for(let i = 1; i < data.length; i++) {
    if(data[i][0] === studentID) {
      sheet.getRange(i + 1, 2, 1, 7).setValues([[
        e.parameter.name || data[i][1],
        e.parameter.class || data[i][2],
        e.parameter.gender || data[i][3],
        e.parameter.parentName || data[i][4],
        e.parameter.parentPhone || data[i][5],
        e.parameter.address || data[i][6],
        e.parameter.status || data[i][7]
      ]]);
      return {success: true, message: "Student updated successfully"};
    }
  }
  
  return {success: false, message: "Student not found"};
}

// ==================== TERM MANAGEMENT ====================

function addTerm(e) {
  const sheet = ss().getSheetByName("Terms");
  const termId = generateId("TERM");
  
  sheet.appendRow([
    termId,
    e.parameter.name,
    e.parameter.academicYear,
    e.parameter.startDate,
    e.parameter.endDate,
    e.parameter.status || 'active',
    new Date()
  ]);
  
  return {success: true, termId: termId, message: "Term added successfully"};
}

function getTerms(e) {
  const sheet = ss().getSheetByName("Terms");
  const data = sheet.getDataRange().getValues();
  
  if(data.length <= 1) {
    return {success: true, terms: []};
  }
  
  const terms = data.slice(1).map(row => ({
    id: row[0],
    name: row[1],
    academicYear: row[2],
    startDate: row[3],
    endDate: row[4],
    status: row[5]
  }));
  
  return {success: true, terms: terms};
}

function updateTerm(e) {
  const termId = e.parameter.termId;
  const sheet = ss().getSheetByName("Terms");
  const data = sheet.getDataRange().getValues();
  
  for(let i = 1; i < data.length; i++) {
    if(data[i][0] === termId) {
      sheet.getRange(i + 1, 2, 1, 5).setValues([[
        e.parameter.name || data[i][1],
        e.parameter.academicYear || data[i][2],
        e.parameter.startDate || data[i][3],
        e.parameter.endDate || data[i][4],
        e.parameter.status || data[i][5]
      ]]);
      return {success: true, message: "Term updated successfully"};
    }
  }
  
  return {success: false, message: "Term not found"};
}

function deleteTerm(e) {
  const termId = e.parameter.termId;
  const sheet = ss().getSheetByName("Terms");
  const data = sheet.getDataRange().getValues();
  
  for(let i = 1; i < data.length; i++) {
    if(data[i][0] === termId) {
      sheet.deleteRow(i + 1);
      return {success: true, message: "Term deleted successfully"};
    }
  }
  
  return {success: false, message: "Term not found"};
}

// ==================== FEE MANAGEMENT ====================

function addFee(e) {
  // Check if this is the new individual fee format or old fee structure format
  if (e.parameter.feeName) {
    // New individual fee format
    const sheet = ss().getSheetByName("IndividualFees") || createIndividualFeesSheet();
    const feeId = generateId("FEE");
    
    sheet.appendRow([
      feeId,
      e.parameter.feeName,
      parseFloat(e.parameter.feeAmount) || 0,
      e.parameter.termId,
      e.parameter.class,
      e.parameter.category || 'miscellaneous',
      'active',
      new Date()
    ]);
    
    return {success: true, feeId: feeId, message: 'Fee added successfully'};
  } else {
    // Legacy fee structure format
    const sheet = ss().getSheetByName("Fees");
    const feeId = generateId("FEE");
    const termId = e.parameter.term;
    const studentClass = e.parameter.class;
    const total = parseFloat(e.parameter.total) || 0;

    const feeItems = {};
    for (const key in e.parameter) {
      if (!['action', 'term', 'class', 'total', 'callback'].includes(key)) {
        feeItems[key] = parseFloat(e.parameter[key]) || 0;
      }
    }
    
    const feeItemsJSON = JSON.stringify(feeItems);
    
    sheet.appendRow([feeId, termId, studentClass, total, feeItemsJSON, new Date()]);
    return {success: true, feeId: feeId, message: 'Fee structure registered successfully'};
  }
}

function createIndividualFeesSheet() {
  const spreadsheet = ss();
  const sheet = spreadsheet.insertSheet("IndividualFees");
  const headers = ['ID', 'Fee Name', 'Amount', 'Term ID', 'Class', 'Category', 'Status', 'Created Date'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  return sheet;
}

function getFees(e) {
  try {
    const sheet = ss().getSheetByName("IndividualFees");
    if (!sheet) {
      return {success: true, fees: []};
    }
    
    const data = sheet.getDataRange().getValues();
    
    if(data.length <= 1) {
      return {success: true, fees: []};
    }
    
    // Get terms data for term names
    const termsSheet = ss().getSheetByName("Terms");
    const termsData = termsSheet.getDataRange().getValues();
    const termMap = {};
    
    for(let i = 1; i < termsData.length; i++) {
      termMap[termsData[i][0]] = termsData[i][1]; // ID -> Name
    }
    
    const fees = data.slice(1).map(row => ({
      id: row[0],
      feeName: row[1],
      feeAmount: parseFloat(row[2]) || 0,
      termId: row[3],
      termName: termMap[row[3]] || row[3],
      class: row[4],
      category: row[5],
      status: row[6] || 'active',
      createdDate: row[7]
    }));
    
    return {success: true, fees: fees};
  } catch (error) {
    return {success: false, message: `Error getting fees: ${error.message}`};
  }
}

function getFee(e) {
  const feeId = e.parameter.feeId;
  
  try {
    const sheet = ss().getSheetByName("IndividualFees");
    if (!sheet) {
      return {success: false, message: "Fees sheet not found"};
    }
    
    const data = sheet.getDataRange().getValues();
    
    for(let i = 1; i < data.length; i++) {
      if(data[i][0] === feeId) {
        return {
          success: true,
          fee: {
            id: data[i][0],
            feeName: data[i][1],
            feeAmount: parseFloat(data[i][2]) || 0,
            termId: data[i][3],
            class: data[i][4],
            category: data[i][5],
            status: data[i][6] || 'active'
          }
        };
      }
    }
    
    return {success: false, message: "Fee not found"};
  } catch (error) {
    return {success: false, message: `Error getting fee: ${error.message}`};
  }
}

function updateFee(e) {
  const feeId = e.parameter.feeId;
  
  try {
    const sheet = ss().getSheetByName("IndividualFees");
    if (!sheet) {
      return {success: false, message: "Fees sheet not found"};
    }
    
    const data = sheet.getDataRange().getValues();
    
    for(let i = 1; i < data.length; i++) {
      if(data[i][0] === feeId) {
        // Update fee name and amount
        const newName = e.parameter.feeName || data[i][1];
        const newAmount = e.parameter.feeAmount ? parseFloat(e.parameter.feeAmount) : data[i][2];
        const newCategory = e.parameter.category || data[i][5];
        const newStatus = e.parameter.status || data[i][6];
        
        sheet.getRange(i + 1, 2, 1, 4).setValues([[newName, newAmount, data[i][3], data[i][4]]]);
        if (newCategory !== data[i][5]) {
          sheet.getRange(i + 1, 6).setValue(newCategory);
        }
        if (newStatus !== data[i][6]) {
          sheet.getRange(i + 1, 7).setValue(newStatus);
        }
        
        return {success: true, message: "Fee updated successfully"};
      }
    }
    
    return {success: false, message: "Fee not found"};
  } catch (error) {
    return {success: false, message: `Error updating fee: ${error.message}`};
  }
}

function deleteFee(e) {
  const feeId = e.parameter.feeId;
  
  try {
    const sheet = ss().getSheetByName("IndividualFees");
    if (!sheet) {
      return {success: false, message: "Fees sheet not found"};
    }
    
    const data = sheet.getDataRange().getValues();
    
    for(let i = 1; i < data.length; i++) {
      if(data[i][0] === feeId) {
        sheet.deleteRow(i + 1);
        return {success: true, message: "Fee deleted successfully"};
      }
    }
    
    return {success: false, message: "Fee not found"};
  } catch (error) {
    return {success: false, message: `Error deleting fee: ${error.message}`};
  }
}

function getFeeStructures(e) {
  const termId = e.parameter.termId;
  const sheet = ss().getSheetByName("Fees");
  const data = sheet.getDataRange().getValues();
  
  if(data.length <= 1) {
    return {success: true, feeStructures: []};
  }
  
  const feeStructures = data.slice(1)
    .filter(row => !termId || row[1] === termId)
    .map(row => {
      const feeItems = JSON.parse(row[4] || '{}');
      return {
        id: row[0],
        termId: row[1],
        class: row[2],
        total: row[3],
        ...feeItems
      };
    });
  
  return {success: true, feeStructures: feeStructures};
}

function updateFeeStructure(e) {
  const feeId = e.parameter.feeId;
  const sheet = ss().getSheetByName("Fees");
  const data = sheet.getDataRange().getValues();
  
  for(let i = 1; i < data.length; i++) {
    if(data[i][0] === feeId) {
      const feeItems = {};
      for (const key in e.parameter) {
        if (!['action', 'feeId', 'total', 'callback'].includes(key)) {
          feeItems[key] = parseFloat(e.parameter[key]) || 0;
        }
      }
      
      const total = parseFloat(e.parameter.total) || 0;
      const feeItemsJSON = JSON.stringify(feeItems);
      
      sheet.getRange(i + 1, 4, 1, 2).setValues([[total, feeItemsJSON]]);
      return {success: true, message: "Fee structure updated successfully"};
    }
  }
  
  return {success: false, message: "Fee structure not found"};
}

function deleteFeeStructure(e) {
  const feeId = e.parameter.feeId;
  const sheet = ss().getSheetByName("Fees");
  const data = sheet.getDataRange().getValues();
  
  for(let i = 1; i < data.length; i++) {
    if(data[i][0] === feeId) {
      sheet.deleteRow(i + 1);
      return {success: true, message: "Fee structure deleted successfully"};
    }
  }
  
  return {success: false, message: "Fee structure not found"};
}

// ==================== PAYMENT MANAGEMENT ====================

function getStudentTermFees(e) {
  const studentID = e.parameter.studentID;
  const termId = e.parameter.termId;
  
  // Get student info
  const studentResult = getStudent({parameter: {studentID: studentID}});
  if(!studentResult.success) {
    return studentResult;
  }
  
  const student = studentResult.student;
  
  // Get fee structure for student's class and term
  const feesSheet = ss().getSheetByName("Fees");
  const feesData = feesSheet.getDataRange().getValues();
  
  let feeStructure = null;
  for(let i = 1; i < feesData.length; i++) {
    if(feesData[i][1] === termId && feesData[i][2] === student.class) {
      const feeItems = JSON.parse(feesData[i][4] || '{}');
      feeStructure = {
        id: feesData[i][0],
        total: feesData[i][3],
        ...feeItems
      };
      break;
    }
  }
  
  if(!feeStructure) {
    return {success: false, message: "No fee structure found for this class and term"};
  }
  
  // Calculate amount paid for this term
  const paymentsSheet = ss().getSheetByName("Payments");
  const paymentsData = paymentsSheet.getDataRange().getValues();
  
  let amountPaid = 0;
  for(let i = 1; i < paymentsData.length; i++) {
    if(paymentsData[i][1] === studentID && paymentsData[i][2] === termId) {
      amountPaid += parseFloat(paymentsData[i][4]) || 0;
    }
  }
  
  return {
    success: true,
    student: student,
    feeStructure: feeStructure,
    amountPaid: amountPaid
  };
}

function addPayment(e) {
  const sheet = ss().getSheetByName("Payments");
  const paymentId = generateId("PAY");
  const receiptId = generateId("REC");
  
  sheet.appendRow([
    paymentId,
    e.parameter.studentID,
    e.parameter.termId,
    e.parameter.date,
    parseFloat(e.parameter.amount) || 0,
    e.parameter.paymentMethod || 'cash',
    e.parameter.reference || '',
    e.parameter.notes || '',
    receiptId,
    new Date()
  ]);

  return {
    success: true, 
    paymentId: paymentId,
    receiptId: receiptId,
    message: 'Payment recorded successfully'
  };
}

// ==================== REPORTING ====================

function getReport(e) {
  const termId = e.parameter.termId;
  const reportType = e.parameter.reportType || 'payment_summary';
  const classFilter = e.parameter.classFilter;
  
  const studentsSheet = ss().getSheetByName("Students");
  const feesSheet = ss().getSheetByName("Fees");
  const paymentsSheet = ss().getSheetByName("Payments");

  const studentsData = studentsSheet.getDataRange().getValues().slice(1);
  const feesData = feesSheet.getDataRange().getValues().slice(1);
  const paymentsData = paymentsSheet.getDataRange().getValues().slice(1);

  // Create student map
  const studentMap = {};
  studentsData.forEach(row => {
    const studentID = row[0];
    const studentClass = row[2];
    
    // Apply class filter if specified
    if(classFilter && studentClass !== classFilter) return;
    
    studentMap[studentID] = {
      studentID: studentID,
      name: row[1],
      class: studentClass,
      totalFee: 0,
      amountPaid: 0
    };
  });

  // Get fee structures for the term
  const classFeeMap = {};
  feesData.forEach(row => {
    if(row[1] === termId) {
      classFeeMap[row[2]] = parseFloat(row[3]) || 0;
    }
  });

  // Assign total fees based on class
  for (const studentID in studentMap) {
    const student = studentMap[studentID];
    student.totalFee = classFeeMap[student.class] || 0;
  }
  
  // Calculate payments for the term
  paymentsData.forEach(row => {
    const studentID = row[1];
    const paymentTermId = row[2];
    const amountPaid = parseFloat(row[4]) || 0;
    
    if(paymentTermId === termId && studentMap[studentID]) {
      studentMap[studentID].amountPaid += amountPaid;
    }
  });

  // Filter based on report type
  let reportData = Object.values(studentMap);
  
  if(reportType === 'outstanding_fees') {
    reportData = reportData.filter(s => s.totalFee > s.amountPaid);
  } else if(reportType === 'paid_fees') {
    reportData = reportData.filter(s => s.amountPaid >= s.totalFee);
  }
  
  return {success: true, data: reportData};
}

function generateFeeReceipt(e) {
  const studentID = e.parameter.studentID;
  const termId = e.parameter.termId;
  
  // Get student and term fee information
  const studentTermResult = getStudentTermFees({parameter: {studentID: studentID, termId: termId}});
  if(!studentTermResult.success) {
    return studentTermResult;
  }
  
  // Get term information
  const termsSheet = ss().getSheetByName("Terms");
  const termsData = termsSheet.getDataRange().getValues();
  
  let term = null;
  for(let i = 1; i < termsData.length; i++) {
    if(termsData[i][0] === termId) {
      term = {
        id: termsData[i][0],
        name: termsData[i][1],
        academicYear: termsData[i][2]
      };
      break;
    }
  }
  
  if(!term) {
    return {success: false, message: "Term not found"};
  }
  
  return {
    success: true,
    data: {
      student: studentTermResult.student,
      term: term,
      feeStructure: studentTermResult.feeStructure,
      amountPaid: studentTermResult.amountPaid
    }
  };
}

// ==================== ADMIN MANAGEMENT ====================

function addAdmin(e) {
  const email = e.parameter.email;
  const role = e.parameter.role;
  const fullName = e.parameter.fullName;
  const password = e.parameter.password || 'admin123'; // Use provided password or default
  
  const sheet = ss().getSheetByName("Admins");
  const data = sheet.getDataRange().getValues();
  
  // Check if admin already exists
  for(let i = 1; i < data.length; i++) {
    if(data[i][0] === email) {
      return {success: false, message: "Administrator already exists"};
    }
  }
  
  sheet.appendRow([email, password, role, fullName, 'active', new Date()]);
  return {success: true, message: "Administrator added successfully with password: " + password};
}

function getAdmins(e) {
  const sheet = ss().getSheetByName("Admins");
  const data = sheet.getDataRange().getValues();
  
  // Debug: Log raw data
  console.log('Raw admin data:', data);
  
  if(data.length <= 1) {
    return {success: true, admins: [], debug: {rowCount: data.length, headers: data[0] || []}};
  }
  
  const admins = data.slice(1).map((row, index) => ({
    email: row[0],
    password: row[1], // Include password for super admin access
    role: row[2],
    fullName: row[3],
    status: row[4],
    debug: {
      rowIndex: index + 1,
      rawRow: row
    }
  }));
  
  return {
    success: true, 
    admins: admins,
    debug: {
      totalRows: data.length,
      headers: data[0],
      dataRowCount: admins.length
    }
  };
}

function updateAdmin(e) {
  const email = e.parameter.email;
  const sheet = ss().getSheetByName("Admins");
  const data = sheet.getDataRange().getValues();
  
  for(let i = 1; i < data.length; i++) {
    if(data[i][0] === email) {
      sheet.getRange(i + 1, 3, 1, 3).setValues([[
        e.parameter.role || data[i][2],
        e.parameter.fullName || data[i][3],
        e.parameter.status || data[i][4]
      ]]);
      return {success: true, message: "Administrator updated successfully"};
    }
  }
  
  return {success: false, message: "Administrator not found"};
}

function updateAdminPassword(e) {
  const email = e.parameter.email;
  const newPassword = e.parameter.password;
  
  if (!newPassword || newPassword.length < 6) {
    return {success: false, message: "Password must be at least 6 characters long"};
  }
  
  const sheet = ss().getSheetByName("Admins");
  const data = sheet.getDataRange().getValues();
  
  for(let i = 1; i < data.length; i++) {
    if(data[i][0] === email) {
      // Update password in column B (index 1)
      sheet.getRange(i + 1, 2).setValue(newPassword);
      return {success: true, message: "Password updated successfully for " + email};
    }
  }
  
  return {success: false, message: "Administrator not found"};
}

function deleteAdmin(e) {
  const email = e.parameter.email;
  const sheet = ss().getSheetByName("Admins");
  const data = sheet.getDataRange().getValues();
  
  for(let i = 1; i < data.length; i++) {
    if(data[i][0] === email) {
      sheet.deleteRow(i + 1);
      return {success: true, message: "Administrator deleted successfully"};
    }
  }
  
  return {success: false, message: "Administrator not found"};
}

// ==================== LEGACY SUPPORT ====================

function getStudentFees(e) {
  const studentID = e.parameter.studentID;
  const studentResult = getStudent({parameter: {studentID: studentID}});
  
  if(!studentResult.success) {
    return studentResult;
  }
  
  const student = studentResult.student;
  
  // Get latest fee structure for student's class
  const feesSheet = ss().getSheetByName("Fees");
  const feesData = feesSheet.getDataRange().getValues();
  const feeStructureRow = feesData.slice(1).reverse().find(row => row[2] === student.class);
  
  if (!feeStructureRow) {
    return {success: false, message: "No fee structure found for class " + student.class};
  }
  
  const feeItems = JSON.parse(feeStructureRow[4]);
  const outstandingFees = {};
  
  for (const feeName in feeItems) {
    outstandingFees[feeName] = parseFloat(feeItems[feeName]) || 0;
  }

  return {success: true, student: student, fees: outstandingFees};
}

function getStudentStatement(e) {
  const studentID = e.parameter.studentID;
  const studentResult = getStudent({parameter: {studentID: studentID}});
  
  if(!studentResult.success) {
    return studentResult;
  }
  
  const student = studentResult.student;
  
  // Get latest fee structure
  const feesSheet = ss().getSheetByName("Fees");
  const feesData = feesSheet.getDataRange().getValues();
  const feeStructureRow = feesData.slice(1).reverse().find(row => row[2] === student.class);
  
  let feeStructure = {};
  let totalFee = 0;
  if (feeStructureRow) {
    feeStructure = JSON.parse(feeStructureRow[4]);
    totalFee = parseFloat(feeStructureRow[3]) || 0;
  }

  // Get payments
  const paymentsSheet = ss().getSheetByName("Payments");
  const paymentsData = paymentsSheet.getDataRange().getValues();
  const paymentsHistory = [];
  let totalPaid = 0;
  
  paymentsData.slice(1).forEach(row => {
    if (row[1] === studentID) {
      const payment = {
        id: row[0],
        date: new Date(row[3]).toLocaleDateString(),
        amount: parseFloat(row[4]) || 0,
        method: row[5] || 'cash'
      };
      paymentsHistory.push(payment);
      totalPaid += payment.amount;
    }
  });

  const balance = totalFee - totalPaid;

  return { 
    success: true, 
    student: student, 
    feeStructure: feeStructure,
    totalFee: totalFee,
    payments: paymentsHistory,
    totalPaid: totalPaid,
    balance: balance
  };
}

function getStudentAccount(e){
  const id = e.parameter.studentID;
  let tf = 0, tp = 0;

  ss().getSheetByName("Fees").getDataRange().getValues()
    .forEach((r,i) => { if(i && r[1] == id) tf += Number(r[3]); });

  ss().getSheetByName("Payments").getDataRange().getValues()
    .forEach((r,i) => { if(i && r[1] == id) tp += Number(r[4]); });

  return {success: true, totalFee: tf, totalPaid: tp, balance: tf - tp};
}

// ==================== DEBUGGING FUNCTIONS ====================

function listRecentSpreadsheets(e) {
  try {
    // Get recent files from Drive
    const files = DriveApp.getFiles();
    const spreadsheets = [];
    
    while (files.hasNext() && spreadsheets.length < 10) {
      const file = files.next();
      if (file.getMimeType() === 'application/vnd.google-apps.spreadsheet') {
        const name = file.getName();
        if (name.toLowerCase().includes('school') || name.toLowerCase().includes('accounting')) {
          spreadsheets.push({
            id: file.getId(),
            name: name,
            url: file.getUrl(),
            lastModified: file.getLastUpdated()
          });
        }
      }
    }
    
    return {
      success: true,
      spreadsheets: spreadsheets,
      currentId: SPREADSHEET_ID,
      message: "Found " + spreadsheets.length + " school-related spreadsheets"
    };
  } catch (error) {
    return {
      success: false,
      message: `Error listing spreadsheets: ${error.message}`
    };
  }
}

function debugAdmins(e) {
  try {
    const spreadsheet = ss();
    const adminsSheet = spreadsheet.getSheetByName("Admins");
    const rawData = adminsSheet.getDataRange().getValues();
    
    return {
      success: true,
      rawData: rawData,
      rowCount: rawData.length,
      headers: rawData.length > 0 ? rawData[0] : [],
      dataRows: rawData.slice(1)
    };
  } catch (error) {
    return {
      success: false,
      message: `Error getting raw admin data: ${error.message}`
    };
  }
}

function getSpreadsheetInfo(e) {
  try {
    const spreadsheet = ss();
    const sheets = spreadsheet.getSheets().map(sheet => ({
      name: sheet.getName(),
      rows: sheet.getLastRow(),
      cols: sheet.getLastColumn()
    }));
    
    return {
      success: true,
      spreadsheetId: spreadsheet.getId(),
      spreadsheetName: spreadsheet.getName(),
      spreadsheetUrl: spreadsheet.getUrl(),
      sheets: sheets
    };
  } catch (error) {
    return {
      success: false,
      message: `Error getting spreadsheet info: ${error.message}`,
      suggestion: "Please create a spreadsheet manually and update the SPREADSHEET_ID"
    };
  }
}

// ==================== SYSTEM STATISTICS ====================

function getSystemStats(e) {
  console.log('getSystemStats function called - now pulling real data');
  
  try {
    // Test spreadsheet access first
    let spreadsheet;
    try {
      spreadsheet = ss();
      console.log('Spreadsheet accessed successfully, ID:', spreadsheet.getId());
    } catch (ssError) {
      console.error('Failed to access spreadsheet:', ssError);
      return {
        success: false,
        message: `Cannot access spreadsheet: ${ssError.message}`,
        error: 'SPREADSHEET_ACCESS_ERROR',
        spreadsheetId: SPREADSHEET_ID,
        timestamp: new Date().toISOString()
      };
    }
    
    // Initialize all stats
    let totalStudents = 0;
    let totalAdmins = 0;
    let activeTerms = 0;
    let totalRevenue = 0;
    let monthlyRevenue = 0;
    let outstandingCount = 0;
    const classCounts = {};
    const errors = [];
    
    // Get current date for monthly calculations
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Get total students and class breakdown
    try {
      const studentsSheet = spreadsheet.getSheetByName("Students");
      if (!studentsSheet) {
        throw new Error('Students sheet not found');
      }
      
      const studentsData = studentsSheet.getDataRange().getValues();
      console.log('Students sheet data rows:', studentsData.length);
      
      if (studentsData.length > 1) {
        totalStudents = studentsData.length - 1; // Subtract header row
        
        // Count students by class
        for (let i = 1; i < studentsData.length; i++) {
          const studentClass = studentsData[i][2]; // Class column (C)
          if (studentClass) {
            classCounts[studentClass] = (classCounts[studentClass] || 0) + 1;
          }
        }
      }
      console.log('Total students:', totalStudents);
      console.log('Class breakdown:', classCounts);
    } catch (error) {
      console.error('Error getting students data:', error);
      errors.push(`Students: ${error.message}`);
      // Continue with other stats even if students fails
    }
    
    // Get total admins
    try {
      const adminsSheet = spreadsheet.getSheetByName("Admins");
      if (!adminsSheet) {
        throw new Error('Admins sheet not found');
      }
      
      const adminsData = adminsSheet.getDataRange().getValues();
      console.log('Admins sheet data rows:', adminsData.length);
      
      if (adminsData.length > 1) {
        totalAdmins = adminsData.length - 1; // Subtract header row
      }
      console.log('Total admins:', totalAdmins);
    } catch (error) {
      console.error('Error getting admins data:', error);
      errors.push(`Admins: ${error.message}`);
      // Continue with other stats
    }
    
    // Get active terms
    try {
      const termsSheet = spreadsheet.getSheetByName("Terms");
      if (!termsSheet) {
        throw new Error('Terms sheet not found');
      }
      
      const termsData = termsSheet.getDataRange().getValues();
      console.log('Terms sheet data rows:', termsData.length);
      
      if (termsData.length > 1) {
        for (let i = 1; i < termsData.length; i++) {
          const termStatus = termsData[i][5]; // Status column (F)
          if (termStatus === 'active') {
            activeTerms++;
          }
        }
      }
      console.log('Active terms:', activeTerms);
    } catch (error) {
      console.error('Error getting terms data:', error);
      errors.push(`Terms: ${error.message}`);
      // Continue with other stats
    }
    
    // Calculate revenue from payments
    try {
      const paymentsSheet = spreadsheet.getSheetByName("Payments");
      if (!paymentsSheet) {
        console.log('Payments sheet not found, skipping revenue calculation');
        errors.push('Payments: Sheet not found');
      } else {
        const paymentsData = paymentsSheet.getDataRange().getValues();
        console.log('Payments sheet data rows:', paymentsData.length);
        
        if (paymentsData.length > 1) {
          for (let i = 1; i < paymentsData.length; i++) {
            const amountStr = paymentsData[i][4]; // Amount column (E)
            const amount = parseFloat(amountStr) || 0;
            totalRevenue += amount;
            
            // Calculate monthly revenue
            try {
              const paymentDateStr = paymentsData[i][3]; // Date column (D)
              const paymentDate = new Date(paymentDateStr);
              
              if (!isNaN(paymentDate.getTime()) && 
                  paymentDate.getMonth() === currentMonth && 
                  paymentDate.getFullYear() === currentYear) {
                monthlyRevenue += amount;
              }
            } catch (dateError) {
              console.error('Error parsing payment date for row', i, ':', dateError);
            }
          }
        }
      }
      console.log('Total revenue:', totalRevenue);
      console.log('Monthly revenue:', monthlyRevenue);
    } catch (error) {
      console.error('Error getting payments data:', error);
      errors.push(`Payments: ${error.message}`);
      // Continue with other stats
    }
    
    // Calculate outstanding payments (simplified approach)
    try {
      // Get fee structures
      const feesSheet = spreadsheet.getSheetByName("Fees");
      if (!feesSheet) {
        console.log('Fees sheet not found, skipping outstanding calculation');
        errors.push('Fees: Sheet not found');
      } else {
        const feesData = feesSheet.getDataRange().getValues();
        console.log('Fees sheet data rows:', feesData.length);
        
        if (feesData.length > 1 && totalStudents > 0) {
          // Create a map of class -> total fee amount
          const classFeeMap = {};
          for (let i = 1; i < feesData.length; i++) {
            const feeClass = feesData[i][2]; // Class column (C)
            const feeTotal = parseFloat(feesData[i][3]) || 0; // Total column (D)
            if (feeClass && feeTotal > 0) {
              classFeeMap[feeClass] = feeTotal;
            }
          }
          console.log('Class fee map:', classFeeMap);
          
          // Count students with outstanding payments
          const studentsSheet = spreadsheet.getSheetByName("Students");
          const studentsData = studentsSheet.getDataRange().getValues();
          const paymentsSheet = spreadsheet.getSheetByName("Payments");
          
          if (paymentsSheet) {
            const paymentsData = paymentsSheet.getDataRange().getValues();
            
            for (let i = 1; i < studentsData.length; i++) {
              const studentId = studentsData[i][0]; // ID column (A)
              const studentClass = studentsData[i][2]; // Class column (C)
              const expectedFee = classFeeMap[studentClass] || 0;
              
              if (expectedFee > 0) {
                // Calculate total payments for this student
                let totalPaid = 0;
                for (let j = 1; j < paymentsData.length; j++) {
                  const paymentStudentId = paymentsData[j][1]; // Student ID column (B)
                  if (paymentStudentId === studentId) {
                    const paymentAmount = parseFloat(paymentsData[j][4]) || 0; // Amount column (E)
                    totalPaid += paymentAmount;
                  }
                }
                
                // If student owes money, count as outstanding
                if (totalPaid < expectedFee) {
                  outstandingCount++;
                }
              }
            }
          }
        }
      }
      console.log('Outstanding payments count:', outstandingCount);
    } catch (error) {
      console.error('Error calculating outstanding payments:', error);
      errors.push(`Outstanding: ${error.message}`);
      // Set to 0 if calculation fails
      outstandingCount = 0;
    }
    
    const result = {
      success: true,
      stats: {
        totalStudents: totalStudents,
        totalAdmins: totalAdmins,
        activeTerms: activeTerms,
        totalRevenue: totalRevenue,
        monthlyRevenue: monthlyRevenue,
        outstandingCount: outstandingCount,
        classCounts: classCounts,
        lastUpdated: new Date().toISOString(),
        dataSource: 'Google Sheets (Real Data)',
        spreadsheetId: spreadsheet.getId(),
        spreadsheetName: spreadsheet.getName(),
        errors: errors.length > 0 ? errors : undefined
      }
    };
    
    console.log('getSystemStats final result:', result);
    return result;
    
  } catch (error) {
    console.error('Critical error in getSystemStats:', error);
    return {
      success: false,
      message: `Critical error getting system statistics: ${error.message}`,
      error: error.toString(),
      spreadsheetId: SPREADSHEET_ID,
      timestamp: new Date().toISOString(),
      suggestion: 'Check if the spreadsheet exists and has the correct structure'
    };
  }
}

// ==================== FALLBACK SYSTEM STATISTICS ====================

function getSystemStatsBasic(e) {
  console.log('getSystemStatsBasic function called - returning test data');
  
  // Return basic test data that doesn't require spreadsheet access
  const result = {
    success: true,
    stats: {
      totalStudents: 25,
      totalAdmins: 3,
      activeTerms: 1,
      totalRevenue: 125000,
      monthlyRevenue: 45000,
      outstandingCount: 8,
      classCounts: {
        'JSS 1': 5,
        'JSS 2': 7,
        'JSS 3': 6,
        'SS 1': 4,
        'SS 2': 3
      },
      lastUpdated: new Date().toISOString(),
      dataSource: 'Test Data (Fallback)',
      note: 'This is test data. Real data requires proper spreadsheet setup.'
    }
  };
  
  console.log('getSystemStatsBasic returning:', result);
  return result;
}