router.post('/', async (req, res) => {
  try {
    const brewStyle = await BrewStyle.create(req.body);
    res.status(201).json(brewStyle);
  } catch (error) {
    if (error.code === 11000 && error.keyPattern.name) {
      return res.status(400).json({
        error: 'Duplicate name',
        message: `A brew style with the name "${error.keyValue.name}" already exists. Please choose a different name.`
      });
    }
    console.error('Error creating brew style:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to create brew style. Please try again.'
    });
  }
}); 