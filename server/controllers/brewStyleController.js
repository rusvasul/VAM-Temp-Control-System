const BrewStyle = require('../models/BrewStyle');
const { validateBrewStyle } = require('../validation/brewStyleSchema');
const debug = require('debug')('app:brewStyles');

exports.createBrewStyle = async (req, res) => {
  try {
    debug('Received brew style data:', JSON.stringify(req.body, null, 2));
    debug('Validating brew style data');
    const { isValid, errors } = validateBrewStyle(req.body);
    
    debug('Validation result:', { isValid, errors });
    
    if (!isValid) {
      debug('Validation failed:', errors);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors 
      });
    }

    debug('Creating new brew style with data:', JSON.stringify(req.body, null, 2));
    const brewStyle = new BrewStyle(req.body);
    
    debug('Attempting to save brew style');
    const savedStyle = await brewStyle.save();
    debug('Brew style saved successfully:', JSON.stringify(savedStyle, null, 2));
    
    res.status(201).json(savedStyle);
  } catch (error) {
    debug('Error creating brew style:', error);
    debug('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error creating brew style', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.updateBrewStyle = async (req, res) => {
  try {
    const { id } = req.params;
    debug(`Updating brew style with ID: ${id}`);
    debug('Request body:', JSON.stringify(req.body, null, 2));
    
    const { isValid, errors } = validateBrewStyle(req.body);
    if (!isValid) {
      debug('Validation failed:', errors);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors 
      });
    }

    debug(`Attempting to update brew style with ID: ${id}`);
    const brewStyle = await BrewStyle.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!brewStyle) {
      debug(`Brew style not found with ID: ${id}`);
      return res.status(404).json({ 
        message: 'Brew style not found' 
      });
    }

    debug('Brew style updated successfully:', JSON.stringify(brewStyle, null, 2));
    res.json(brewStyle);
  } catch (error) {
    debug('Error updating brew style:', error);
    debug('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error updating brew style', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.getBrewStyle = async (req, res) => {
  try {
    const { id } = req.params;
    debug(`Fetching brew style with ID: ${id}`);
    
    const brewStyle = await BrewStyle.findById(id);
    if (!brewStyle) {
      debug(`Brew style not found with ID: ${id}`);
      return res.status(404).json({ 
        message: 'Brew style not found' 
      });
    }

    debug('Brew style fetched successfully');
    res.json(brewStyle);
  } catch (error) {
    debug('Error fetching brew style:', error);
    res.status(500).json({ 
      message: 'Error fetching brew style', 
      error: error.message 
    });
  }
};

exports.getAllBrewStyles = async (req, res) => {
  try {
    debug('Fetching all brew styles');
    const brewStyles = await BrewStyle.find();
    
    debug(`Found ${brewStyles.length} brew styles`);
    res.json(brewStyles);
  } catch (error) {
    debug('Error fetching brew styles:', error);
    res.status(500).json({ 
      message: 'Error fetching brew styles', 
      error: error.message 
    });
  }
};

exports.deleteBrewStyle = async (req, res) => {
  try {
    const { id } = req.params;
    debug(`Deleting brew style with ID: ${id}`);
    
    const brewStyle = await BrewStyle.findByIdAndDelete(id);
    if (!brewStyle) {
      debug(`Brew style not found with ID: ${id}`);
      return res.status(404).json({ 
        message: 'Brew style not found' 
      });
    }

    debug('Brew style deleted successfully');
    res.json({ message: 'Brew style deleted successfully' });
  } catch (error) {
    debug('Error deleting brew style:', error);
    res.status(500).json({ 
      message: 'Error deleting brew style', 
      error: error.message 
    });
  }
};

exports.getBrewStylesByType = async (req, res) => {
  try {
    const { type } = req.params;
    if (!['mead', 'cider', 'beer'].includes(type)) {
      debug('Invalid beverage type requested:', type);
      return res.status(400).json({ message: 'Invalid beverage type' });
    }

    const brewStyles = await BrewStyle.find({ beverageType: type });
    debug('Retrieved brew styles by type:', type, brewStyles);
    res.json(brewStyles);
  } catch (error) {
    debug('Error getting brew styles by type:', error);
    res.status(500).json({ message: error.message });
  }
}; 