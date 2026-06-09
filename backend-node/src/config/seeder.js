const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');
const {
  Department, Vendor, Employee, AssetCategory, Asset,
  AssetAllocation, MaintenanceRequest, WarrantyTracking,
  AuditLog, AssetMovement, Notification, User
} = require('../models');

async function seedEnterpriseData() {
  try {
    // 1. Check if database is already seeded
    const assetCount = await Asset.count();
    if (assetCount > 0) {
      logger.info('ℹ️ Database already contains enterprise asset data. Skipping seeding.');
      return;
    }

    logger.info('🌱 Seeding realistic enterprise demo data...');

    // Get default users for relations
    const adminUser = await User.findOne({ where: { email: 'admin@company.com' } });
    const adminId = adminUser ? adminUser.id : 1;

    // 2. Seed 20 Departments
    const departmentsData = [
      { name: 'Information Technology' },
      { name: 'Human Resources' },
      { name: 'Finance & Accounts' },
      { name: 'Sales & Marketing' },
      { name: 'Operations & Logistics' },
      { name: 'Research & Development' },
      { name: 'Customer Support' },
      { name: 'Legal & Compliance' },
      { name: 'Procurement & Purchasing' },
      { name: 'Quality Assurance' },
      { name: 'Engineering & Maintenance' },
      { name: 'Administration & Facilities' },
      { name: 'Corporate Communications' },
      { name: 'Security & Safety' },
      { name: 'Public Relations' },
      { name: 'Business Development' },
      { name: 'Product Management' },
      { name: 'Design & Creative' },
      { name: 'Training & Enablement' },
      { name: 'Strategy & Planning' }
    ];
    const departments = await Department.bulkCreate(departmentsData);
    logger.info(`✅ Seeded ${departments.length} Departments`);

    // 3. Seed 20 Vendors
    const vendorsData = Array.from({ length: 20 }).map((_, i) => {
      const names = [
        'Dell India Tech', 'HP Enterprise Solutions', 'Lenovo Global Store', 'Apple Business Corp',
        'Cisco Systems Ltd', 'Canon Office World', 'Epson Digital Store', 'D-Link Networking',
        'Samsung Electronics', 'LG Commercial Displays', 'Blue Star Cooling', 'Voltas AC Labs',
        'Godrej Interio Office', 'Steelcase Furniture', 'Tata Motors Commercial', 'Mahindra Logistics',
        'Microsoft Licensing', 'AWS Services India', 'Oracle Database Solutions', 'Adobe Business Center'
      ];
      const name = names[i];
      const code = name.replace(/\s+/g, '').substring(0, 8).toUpperCase() + `-${100 + i}`;
      return {
        name,
        vendorCode: code,
        contactPerson: `Contact Person ${i + 1}`,
        email: `sales@${code.toLowerCase()}.com`,
        phone: `+91 98765 00${10 + i}`,
        address: `Commercial complex, Phase ${1 + (i % 5)}, Sector ${10 + i}, Tech City`,
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        pincode: `4000${10 + i}`,
        gstin: `27AAAAA00${10 + i}A1Z${i % 9}`,
        website: `https://${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        avgRating: (4.0 + (i % 10) * 0.1).toFixed(2),
        totalRatings: 5 + (i % 5),
        isActive: true,
        notes: `Enterprise vendor for category ${i + 1}`
      };
    });
    const vendors = await Vendor.bulkCreate(vendorsData);
    logger.info(`✅ Seeded ${vendors.length} Vendors`);

    // 4. Seed 50 Employees
    const employeesData = Array.from({ length: 50 }).map((_, i) => {
      const firstNames = [
        'Rajesh', 'Suresh', 'Amit', 'Priya', 'Neha', 'Rohan', 'Vikram', 'Anjali', 'Deepak', 'Jyoti',
        'Sunil', 'Karan', 'Meera', 'Ritu', 'Vijay', 'Rahul', 'Pooja', 'Sanjay', 'Arun', 'Kiran',
        'Preeti', 'Abhishek', 'Nitin', 'Divya', 'Shalini', 'Gaurav', 'Manish', 'Swati', 'Alok', 'Sachin',
        'Sneha', 'Vivek', 'Varun', 'Richa', 'Nisha', 'Aakash', 'Ravi', 'Simran', 'Tanvi', 'Ayush',
        'Pranav', 'Payal', 'Harish', 'Kartik', 'Shruti', 'Aniket', 'Komal', 'Tushar', 'Yash', 'Ishita'
      ];
      const lastNames = [
        'Sharma', 'Verma', 'Kumar', 'Patel', 'Singh', 'Gupta', 'Joshi', 'Mehta', 'Reddy', 'Rao',
        'Nair', 'Sharma', 'Mishra', 'Choudhury', 'Pandey', 'Saxena', 'Bose', 'Das', 'Sen', 'Roy',
        'Iyer', 'Pillai', 'Deshmukh', 'Kulkarni', 'Joshi', 'Bhat', 'Rao', 'Shetty', 'Hegde', 'Gowda',
        'Nayak', 'Sawant', 'Jadhav', 'Kadam', 'Shinde', 'Patil', 'Joshi', 'Mahajan', 'Kapoor', 'Malhotra',
        'Sethi', 'Bhasin', 'Oberoi', 'Khanna', 'Anand', 'Gill', 'Ahluwalia', 'Sandhu', 'Dhillon', 'Bansal'
      ];
      const designations = [
        'Software Engineer', 'Senior Engineer', 'Technical Lead', 'Product Manager', 'HR Executive',
        'HR Manager', 'Financial Analyst', 'Finance Manager', 'Marketing Executive', 'Sales Director',
        'Operations Manager', 'Database Administrator', 'Network Engineer', 'QA Specialist', 'Legal Counsel',
        'Facilities Executive', 'Support Engineer', 'Security Lead', 'PR Manager', 'Business Analyst'
      ];

      const dep = departments[i % departments.length];
      const firstName = firstNames[i];
      const lastName = lastNames[i];

      return {
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`,
        phone: `+91 99887 000${10 + i}`,
        departmentId: dep.id,
        designation: designations[i % designations.length],
        employeeCode: `EMP-${1000 + i}`,
        joiningDate: new Date(Date.now() - (365 * 24 * 60 * 60 * 1000) * (1 + (i % 3)))
      };
    });
    const employees = await Employee.bulkCreate(employeesData);
    logger.info(`✅ Seeded ${employees.length} Employees`);

    // 5. Seed Asset Categories
    const categoriesData = [
      { name: 'Laptops' },
      { name: 'Desktops' },
      { name: 'Printers' },
      { name: 'Servers' },
      { name: 'Routers' },
      { name: 'Switches' },
      { name: 'Projectors' },
      { name: 'Air Conditioners' },
      { name: 'Furniture' },
      { name: 'Vehicles' },
      { name: 'Software Licenses' }
    ];
    const categories = await AssetCategory.bulkCreate(categoriesData);
    logger.info(`✅ Seeded ${categories.length} Asset Categories`);

    // 6. Seed 100 Assets
    const assetsData = [];
    const categoryMapping = {
      'Laptops': { brands: ['Dell', 'HP', 'Apple', 'Lenovo'], models: ['Latitude 5420', 'EliteBook 840', 'MacBook Pro 14', 'ThinkPad T14'], cost: 85000 },
      'Desktops': { brands: ['Dell', 'HP', 'Lenovo'], models: ['OptiPlex 7090', 'ProDesk 400', 'ThinkCentre M70q'], cost: 55000 },
      'Printers': { brands: ['HP', 'Canon', 'Epson'], models: ['LaserJet Pro M404dn', 'imageRUNNER 2206', 'EcoTank L3210'], cost: 25000 },
      'Servers': { brands: ['Dell', 'HP', 'Lenovo'], models: ['PowerEdge R750', 'ProLiant DL380 Gen10', 'ThinkSystem SR650'], cost: 250000 },
      'Routers': { brands: ['Cisco', 'Juniper', 'D-Link'], models: ['ISR 4331', 'SRX300', 'DSR-1000AC'], cost: 45000 },
      'Switches': { brands: ['Cisco', 'Aruba', 'D-Link'], models: ['Catalyst 9300', 'CX 6100', 'DGS-1510'], cost: 65000 },
      'Projectors': { brands: ['Epson', 'BenQ', 'Sony'], models: ['EB-E01', 'MX560', 'VPL-DX221'], cost: 35000 },
      'Air Conditioners': { brands: ['Voltas', 'Blue Star', 'Daikin'], models: ['Vectra 1.5T', 'Inverter split 1.5T', 'FTKF50'], cost: 42000 },
      'Furniture': { brands: ['Godrej Interio', 'Steelcase', 'Featherlite'], models: ['Workstation Table', 'Ergonomic Chair', 'Conference Table'], cost: 15000 },
      'Vehicles': { brands: ['Tata', 'Mahindra', 'Maruti'], models: ['Tigor EV', 'Bolero Neo', 'Eeco Cargo'], cost: 950000 },
      'Software Licenses': { brands: ['Microsoft', 'Adobe', 'Oracle'], models: ['Office 365 Enterprise', 'Creative Cloud', 'Java SE Subscription'], cost: 12000 }
    };

    const statuses = ['AVAILABLE', 'ASSIGNED', 'UNDER_REPAIR', 'DISPOSED'];

    for (let i = 0; i < 100; i++) {
      const category = categories[i % categories.length];
      const categoryConfig = categoryMapping[category.name];
      const brand = categoryConfig.brands[i % categoryConfig.brands.length];
      const model = categoryConfig.models[i % categoryConfig.models.length];
      const baseCost = categoryConfig.cost;
      const cost = Math.round(baseCost * (0.9 + (i % 5) * 0.05));

      // Balance statuses: mostly ASSIGNED and AVAILABLE
      let status = 'AVAILABLE';
      if (i % 10 === 0) status = 'UNDER_REPAIR';
      else if (i % 15 === 0) status = 'DISPOSED';
      else if (i % 2 === 0) status = 'ASSIGNED';

      const dep = departments[i % departments.length];
      const emp = status === 'ASSIGNED' ? employees[i % employees.length] : null;
      const vendor = vendors[i % vendors.length];

      const purchaseDate = new Date(Date.now() - (365 * 24 * 60 * 60 * 1000) * (0.5 + (i % 4) * 0.5));
      const expDays = status === 'DISPOSED' ? -100 : (365 * (1 + (i % 3)));
      const expiryDate = new Date(purchaseDate.getTime() + (expDays * 24 * 60 * 60 * 1000));

      // Calculate depreciated current value
      const ageInYears = (Date.now() - purchaseDate.getTime()) / (365 * 24 * 60 * 60 * 1000);
      const deprecRate = 0.15; // 15% straight line/reducing
      const currentValue = Math.max(0, Math.round(cost * Math.pow(1 - deprecRate, ageInYears)));

      assetsData.push({
        name: `${brand} ${model}`,
        assetTag: `AST-${10000 + i}`,
        categoryId: category.id,
        brand,
        model,
        serialNumber: `SN-${brand.substring(0,3).toUpperCase()}${i * 98765}`,
        purchaseDate,
        purchaseCost: cost,
        currentValue,
        vendorId: vendor.id,
        departmentId: dep.id,
        assigned_to_id: emp ? emp.id : null,
        location: `Office Floor ${1 + (i % 4)}, Desk ${10 + (i % 40)}`,
        warrantyExpiry: expiryDate,
        status,
        qrCode: `AST-${10000 + i}`,
        created_by_id: adminId
      });
    }

    const assets = await Asset.bulkCreate(assetsData);
    logger.info(`✅ Seeded ${assets.length} Assets`);

    // 7. Seed 150 Asset Assignments (Allocations)
    // To have 150 allocations for 100 assets, some assets will have previous returned/transferred assignments
    const allocationsData = [];
    let allocationCounter = 0;

    // First, seed returned historical assignments
    for (let i = 0; i < 75; i++) {
      const asset = assets[i % assets.length];
      const emp = employees[(i + 5) % employees.length];
      const allocatedDate = new Date(asset.purchaseDate.getTime() + (10 * 24 * 60 * 60 * 1000));
      const expectedReturn = new Date(allocatedDate.getTime() + (90 * 24 * 60 * 60 * 1000));
      const actualReturn = new Date(expectedReturn.getTime() - (5 * 24 * 60 * 60 * 1000));

      allocationsData.push({
        assetId: asset.id,
        employeeId: emp.id,
        allocatedById: adminId,
        returnedToId: adminId,
        allocatedDate,
        expectedReturn,
        actualReturn,
        status: 'RETURNED',
        purpose: 'Temporary project requirement',
        notes: 'Asset returned in good condition.'
      });
    }

    // Next, seed current active assignments for assets that are marked ASSIGNED
    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];
      if (asset.status === 'ASSIGNED') {
        const emp = employees[i % employees.length];
        const allocatedDate = new Date(asset.purchaseDate.getTime() + (15 * 24 * 60 * 60 * 1000));
        const expectedReturn = new Date(allocatedDate.getTime() + (365 * 24 * 60 * 60 * 1000));

        allocationsData.push({
          assetId: asset.id,
          employeeId: emp.id,
          allocatedById: adminId,
          allocatedDate,
          expectedReturn,
          status: 'ACTIVE',
          purpose: 'Official workspace deployment',
          notes: 'Standard assignment.'
        });
      }
    }

    // If we need more assignments to reach 150
    const currentAllocCount = allocationsData.length;
    if (currentAllocCount < 150) {
      const diff = 150 - currentAllocCount;
      for (let i = 0; i < diff; i++) {
        const asset = assets[(i * 3) % assets.length];
        const emp = employees[(i * 2) % employees.length];
        const allocatedDate = new Date(asset.purchaseDate.getTime() + (5 * 24 * 60 * 60 * 1000));
        const expectedReturn = new Date(allocatedDate.getTime() + (60 * 24 * 60 * 60 * 1000));
        const actualReturn = new Date(expectedReturn.getTime());

        allocationsData.push({
          assetId: asset.id,
          employeeId: emp.id,
          allocatedById: adminId,
          returnedToId: adminId,
          allocatedDate,
          expectedReturn,
          actualReturn,
          status: 'RETURNED',
          purpose: 'Training event usage',
          notes: 'Returned.'
        });
      }
    }

    const allocations = await AssetAllocation.bulkCreate(allocationsData);
    logger.info(`✅ Seeded ${allocations.length} Asset Assignments`);

    // 8. Seed 50 Maintenance Records
    const maintenanceData = [];
    const issues = [
      'Screen flickering', 'Keyboard replaced', 'RAM upgrade required', 'Overheating issue',
      'Operating System reinstalled', 'Network card failure', 'Toner replacement',
      'Battery swollen', 'AC compressor replacement', 'AC filter cleanup', 'Wheel alignment',
      'License renewal', 'HDD crash recovery', 'Power supply issue'
    ];

    for (let i = 0; i < 50; i++) {
      const asset = assets[i % assets.length];
      const status = i % 5 === 0 ? 'PENDING' : (i % 8 === 0 ? 'ONGOING' : 'COMPLETED');
      const startDate = new Date(asset.purchaseDate.getTime() + (45 * 24 * 60 * 60 * 1000));
      const nextDueDate = status === 'COMPLETED' ? new Date(startDate.getTime() + (180 * 24 * 60 * 60 * 1000)) : null;

      maintenanceData.push({
        assetId: asset.id,
        maintenanceType: issues[i % issues.length],
        description: `Detailed checkup and repair performed for issue: ${issues[i % issues.length]}`,
        startDate,
        nextDueDate,
        status,
        cost: status === 'COMPLETED' ? Math.round(1500 * (1 + (i % 8))) : 0.00,
        technician: `Technician Team ${1 + (i % 4)}`
      });
    }
    const maintenanceRecords = await MaintenanceRequest.bulkCreate(maintenanceData);
    logger.info(`✅ Seeded ${maintenanceRecords.length} Maintenance Records`);

    // 9. Seed 50 Warranty Records
    const warrantyData = [];
    for (let i = 0; i < 50; i++) {
      const asset = assets[(i * 2) % assets.length];
      const expiry = new Date(asset.purchaseDate.getTime() + (365 * 24 * 60 * 60 * 1000));
      const vendor = vendors[i % vendors.length];
      const types = ['MANUFACTURER', 'EXTENDED', 'THIRD_PARTY', 'ON_SITE', 'COMPREHENSIVE'];

      warrantyData.push({
        assetId: asset.id,
        warrantyType: types[i % types.length],
        startDate: asset.purchaseDate,
        expiryDate: expiry,
        providerName: vendor.name,
        contractNumber: `WNT-${10000 + i}`,
        notes: 'Standard enterprise warranty support.'
      });
    }
    const warranties = await WarrantyTracking.bulkCreate(warrantyData);
    logger.info(`✅ Seeded ${warranties.length} Warranty Records`);

    // 10. Seed 100 Audit Logs
    const auditData = Array.from({ length: 100 }).map((_, i) => {
      const actions = [
        'CREATE_ASSET', 'UPDATE_ASSET', 'ASSIGN_ASSET', 'RETURN_ASSET',
        'UPDATE_VENDORS', 'UPDATE_EMPLOYEE', 'ADD_MAINTENANCE', 'COMPLETE_MAINTENANCE'
      ];
      return {
        performed_by_id: adminId,
        action: actions[i % actions.length],
        details: `Performed system action ${actions[i % actions.length]} for record ID ${i + 1}`,
        ipAddress: `192.168.1.${10 + (i % 50)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0'
      };
    });
    const audits = await AuditLog.bulkCreate(auditData);
    logger.info(`✅ Seeded ${audits.length} Audit Logs`);

    // 11. Seed 100 Asset Movements
    const movementsData = [];
    for (let i = 0; i < 100; i++) {
      const asset = assets[i % assets.length];
      const depFrom = departments[i % departments.length];
      const depTo = departments[(i + 1) % departments.length];

      movementsData.push({
        assetId: asset.id,
        fromLocation: `Office Floor ${1 + (i % 4)}, Desk ${10 + (i % 40)}`,
        toLocation: `Office Floor ${1 + ((i + 1) % 4)}, Room ${20 + (i % 10)}`,
        fromDepartmentId: depFrom.id,
        toDepartmentId: depTo.id,
        movementDate: new Date(asset.purchaseDate.getTime() + (30 * 24 * 60 * 60 * 1000)),
        moved_by_id: adminId
      });
    }
    const movements = await AssetMovement.bulkCreate(movementsData);
    logger.info(`✅ Seeded ${movements.length} Asset Movements`);

    // 12. Seed 50 Notifications
    const notificationsData = [];
    const notificationTitles = [
      'Asset Assigned', 'Asset Returned', 'Warranty Expiring Soon', 'Maintenance Completed'
    ];
    const messages = [
      'Asset has been assigned to employee successfully.',
      'Asset returned by employee and checked back in.',
      'Warranty for asset is expiring within the next 30 days.',
      'Maintenance work order has been completed by technician.'
    ];
    const types = ['INFO', 'SUCCESS', 'WARNING', 'SUCCESS'];

    for (let i = 0; i < 50; i++) {
      const index = i % 4;
      notificationsData.push({
        userId: adminId,
        title: notificationTitles[index],
        message: `${messages[index]} Asset Ref: AST-${10000 + (i % assets.length)}`,
        type: types[index],
        isRead: i % 3 === 0
      });
    }
    const notifications = await Notification.bulkCreate(notificationsData);
    logger.info(`✅ Seeded ${notifications.length} Notifications`);

    logger.info('🎉 Seeded realistic enterprise demo data successfully!');
  } catch (error) {
    logger.error(`❌ Seeding enterprise demo data failed: ${error.message}`);
  }
}

module.exports = { seedEnterpriseData };
