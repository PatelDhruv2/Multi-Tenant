const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/User');
const Organization = require('../model/Organization');
const { decodePasskey } = require('../utils/Token');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, orgId: user.organization },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

exports.register = async (req, res) => {
  try {
   const { name, email, password, orgName, passkey } = req.body;
let orgId, role;

if (passkey) {
  const data = decodePasskey(passkey);
  if (!data) return res.status(400).json({ message: 'Invalid invite code' });
  orgId = data.orgId;
  role = data.role;
}



    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    let organization;

    if (orgId) {
      // Join existing organization
      organization = await Organization.findById(orgId);
      if (!organization) return res.status(404).json({ message: 'Organization not found' });
    } else {
      // Create new organization
      organization = new Organization({ name: orgName });
      await organization.save();
    }

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || (orgId ? 'Member' : 'Admin'), // Admin if creating org
      organization: organization._id
    });

    await user.save();

    // Add user to org's member list if joining
    if (orgId) {
      organization.members.push(user._id);
      await organization.save();
    } else {
      organization.createdBy = user._id;
      organization.members.push(user._id);
      await organization.save();
    }

    const token = generateToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate('organization');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user);
    res.status(200).json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = req.user // set by auth middleware

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" })
    }

  

    return res.json({ user })
  } catch (error) {
    console.error("Error in /me:", error)
    res.status(500).json({ message: "Server error" })
  }
}

