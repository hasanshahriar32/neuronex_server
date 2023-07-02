const User = require("../Model/userModel");

// Make a user an admin
exports.makeUserAdmin = async (req, res) => {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, { userAbout: "admin" }, { new: true });
    if (!user) {
        return res.status(404).json({ error: 'User not found.' });
    }
    res.status(200).json(user);
};

