const { Op, fn, col } = require('sequelize');
const { Vendor, VendorRating, User } = require('../models');
const { ResourceNotFoundError } = require('../middleware/errorHandler');
const { generateVendorCode } = require('../utils/assetTagGenerator');
const { PagedResponse } = require('../utils/apiResponse');
const auditLogService = require('./auditLogService');

async function createVendor(data, currentUserId) {
  const vendor = await Vendor.create({
    name: data.name,
    contactPerson: data.contactPerson || null,
    email: data.email || null,
    phone: data.phone || null,
    address: data.address || null,
    city: data.city || null,
    state: data.state || null,
    country: data.country || 'India',
    pincode: data.pincode || null,
    gstin: data.gstin || null,
    website: data.website || null,
    notes: data.notes || null,
    isActive: true,
    avgRating: 0.00,
    totalRatings: 0,
  });

  vendor.vendorCode = generateVendorCode(vendor.id);
  await vendor.save();

  await auditLogService.log('CREATE', 'VENDOR', vendor.id, null,
    { name: vendor.name }, 'Vendor created', currentUserId);

  return toResponse(vendor);
}

async function updateVendor(id, data, currentUserId) {
  const vendor = await findById(id);
  await vendor.update({
    name: data.name,
    contactPerson: data.contactPerson,
    email: data.email,
    phone: data.phone,
    address: data.address,
    city: data.city,
    state: data.state,
    country: data.country,
    pincode: data.pincode,
    gstin: data.gstin,
    website: data.website,
    notes: data.notes,
    isActive: data.isActive !== undefined ? data.isActive : vendor.isActive,
  });
  return toResponse(vendor);
}

async function deleteVendor(id, currentUserId) {
  const vendor = await findById(id);
  await vendor.update({ isActive: false });
}

async function getVendor(id) {
  return toResponse(await findById(id));
}

async function getVendors({ search, page = 0, size = 10 } = {}) {
  const where = { isActive: true };
  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { contactPerson: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
      { vendorCode: { [Op.like]: `%${search}%` } },
    ];
  }

  const { count, rows } = await Vendor.findAndCountAll({
    where,
    order: [['name', 'ASC']],
    limit: size,
    offset: page * size,
  });

  return PagedResponse.from(rows.map(toResponse), count, page, size);
}

async function rateVendor(vendorId, ratingData, currentUserId) {
  const vendor = await findById(vendorId);

  await VendorRating.create({
    vendorId,
    ratedById: currentUserId,
    rating: ratingData.rating,
    review: ratingData.review || null,
  });

  // Recalculate average
  const result = await VendorRating.findAll({
    where: { vendorId },
    attributes: [[fn('AVG', col('rating')), 'avgRating'], [fn('COUNT', col('id')), 'count']],
    raw: true,
  });

  const avg = parseFloat(result[0]?.avgRating || 0).toFixed(2);
  const count = parseInt(result[0]?.count || 0);

  await vendor.update({ avgRating: avg, totalRatings: count });
  return toResponse(await findById(vendorId));
}

async function findById(id) {
  const vendor = await Vendor.findByPk(id);
  if (!vendor) throw new ResourceNotFoundError('Vendor', 'id', id);
  return vendor;
}

function toResponse(v) {
  const obj = v.toJSON ? v.toJSON() : v;
  return {
    id: obj.id,
    vendorCode: obj.vendorCode,
    name: obj.name,
    contactPerson: obj.contactPerson,
    email: obj.email,
    phone: obj.phone,
    address: obj.address,
    city: obj.city,
    state: obj.state,
    country: obj.country,
    pincode: obj.pincode,
    gstin: obj.gstin,
    website: obj.website,
    avgRating: obj.avgRating ? parseFloat(obj.avgRating) : 0,
    totalRatings: obj.totalRatings || 0,
    isActive: obj.isActive,
    notes: obj.notes,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
}

module.exports = { createVendor, updateVendor, deleteVendor, getVendor, getVendors, rateVendor };
