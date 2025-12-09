// SCAN CONTROLLERS

// Scan controller handling all scan operations
import Scan from '../models/Scan.model.js';
import User from '../models/User.model.js';
import {
    checkPasswordStrength,
    generateRecommendations,
    scanEmail,
    scanPhone,
    scanUsername
} from '../services/scan.service.js';

// Create and execute username scan
export const performUsernameScan = async (req, res) => {
  try {
    const { username } = req.body;
    const userId = req.user._id;

    if (!username || username.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Username is required'
      });
    }

    // Create scan record
    const scan = new Scan({
      userId,
      scanType: 'username',
      scanInput: username.trim(),
      status: 'processing'
    });
    await scan.save();

    // Perform the scan
    const platformsFound = await scanUsername(username.trim());
    
    // Update scan with results
    scan.results.platformsFound = platformsFound;
    scan.results.recommendations = generateRecommendations('username', { platformsFound });
    
    // Calculate risk score
    scan.calculateRiskScore();
    scan.status = 'completed';
    scan.completedAt = new Date();
    await scan.save();

    // Update user stats
    await User.findByIdAndUpdate(userId, {
      $inc: { totalScans: 1 },
      $set: { lastScanDate: new Date() },
      $max: { riskScore: scan.riskScore }
    });

    res.status(200).json({
      success: true,
      message: 'Username scan completed successfully',
      data: {
        scanId: scan._id,
        scan: scan
      }
    });
  } catch (error) {
    console.error('Username scan error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error performing username scan'
    });
  }
};

// Create and execute email scan
export const performEmailScan = async (req, res) => {
  try {
    const { email } = req.body;
    const userId = req.user._id;

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Valid email is required'
      });
    }

    // Create scan record
    const scan = new Scan({
      userId,
      scanType: 'email',
      scanInput: email.trim().toLowerCase(),
      status: 'processing'
    });
    await scan.save();

    // Perform the scan
    const breaches = await scanEmail(email.trim().toLowerCase());
    
    // Update scan with results
    scan.results.breaches = breaches;
    scan.results.recommendations = generateRecommendations('email', { breaches });
    
    // Extract exposed data classes
    const exposedData = [...new Set(breaches.flatMap(b => b.dataClasses))];
    scan.results.exposedData = exposedData;
    
    // Calculate risk score
    scan.calculateRiskScore();
    scan.status = 'completed';
    scan.completedAt = new Date();
    await scan.save();

    // Update user stats
    await User.findByIdAndUpdate(userId, {
      $inc: { totalScans: 1 },
      $set: { lastScanDate: new Date() },
      $max: { riskScore: scan.riskScore }
    });

    res.status(200).json({
      success: true,
      message: 'Email scan completed successfully',
      data: {
        scanId: scan._id,
        scan: scan
      }
    });
  } catch (error) {
    console.error('Email scan error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error performing email scan'
    });
  }
};

// Create and execute phone scan
export const performPhoneScan = async (req, res) => {
  try {
    const { phone } = req.body;
    const userId = req.user._id;

    if (!phone || phone.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Create scan record
    const scan = new Scan({
      userId,
      scanType: 'phone',
      scanInput: phone.trim(),
      status: 'processing'
    });
    await scan.save();

    // Perform the scan
    const phoneExposure = await scanPhone(phone.trim());
    
    // Update scan with results
    scan.results.phoneExposure = phoneExposure;
    scan.results.recommendations = generateRecommendations('phone', { phoneExposure });
    
    // Calculate risk score
    scan.calculateRiskScore();
    scan.status = 'completed';
    scan.completedAt = new Date();
    await scan.save();

    // Update user stats
    await User.findByIdAndUpdate(userId, {
      $inc: { totalScans: 1 },
      $set: { lastScanDate: new Date() },
      $max: { riskScore: scan.riskScore }
    });

    res.status(200).json({
      success: true,
      message: 'Phone scan completed successfully',
      data: {
        scanId: scan._id,
        scan: scan
      }
    });
  } catch (error) {
    console.error('Phone scan error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error performing phone scan'
    });
  }
};

// Password strength checker (no scan record needed)
export const checkPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    const result = checkPasswordStrength(password);

    res.status(200).json({
      success: true,
      message: 'Password strength checked',
      data: result
    });
  } catch (error) {
    console.error('Password check error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error checking password'
    });
  }
};

// Get scan by ID
export const getScanById = async (req, res) => {
  try {
    const { scanId } = req.params;
    const userId = req.user._id;

    const scan = await Scan.findOne({ _id: scanId, userId });

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: 'Scan not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { scan }
    });
  } catch (error) {
    console.error('Get scan error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching scan'
    });
  }
};

// Get all scans for user
export const getUserScans = async (req, res) => {
  try {
    const userId = req.user._id;
    const { scanType, limit = 10, page = 1 } = req.query;

    const query = { userId };
    if (scanType) {
      query.scanType = scanType;
    }

    const skip = (page - 1) * limit;

    const scans = await Scan.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Scan.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        scans,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user scans error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching scans'
    });
  }
};

// Get scan statistics for user
export const getScanStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Scan.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: '$scanType',
          count: { $sum: 1 },
          avgRiskScore: { $avg: '$riskScore' },
          maxRiskScore: { $max: '$riskScore' }
        }
      }
    ]);

    const totalScans = await Scan.countDocuments({ userId });
    const recentScans = await Scan.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('scanType scanInput riskScore createdAt');

    res.status(200).json({
      success: true,
      data: {
        totalScans,
        statsByType: stats,
        recentScans
      }
    });
  } catch (error) {
    console.error('Get scan stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching scan statistics'
    });
  }
};

// Delete scan
export const deleteScan = async (req, res) => {
  try {
    const { scanId } = req.params;
    const userId = req.user._id;

    const scan = await Scan.findOneAndDelete({ _id: scanId, userId });

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: 'Scan not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Scan deleted successfully'
    });
  } catch (error) {
    console.error('Delete scan error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting scan'
    });
  }
};