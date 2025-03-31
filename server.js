const express = require('express')
const cors = require('cors');
const uuid = require('uuid')

const port = 5000
const knex = require('./dbConnect')
const app = express()

app.use(cors());
app.use(express.json())

app.post('/students', async (req, res) => {
    const { name, mobile, address, email, internshipDomain, college, password } = req.body;
    // Validate the request body
    if (!name || !mobile || !address || !email || !internshipDomain || !college || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    try {
        // Insert the student data into the database
        await knex('students').insert({
            "id": uuid.v4(),
            "name": name,
            "mobile": mobile,
            "address": address,
            "email": email,
            "internshipDomain": internshipDomain,
            "college": college,
            "password": password,
            "isActive": 0
        });
        res.status(201).json({ message: 'Student created successfully' });
    } catch (error) {
        console.error('Error inserting student:', error);
        res.status(500).json({ error: 'Failed to create student' });
    }
});

app.get('/students', async (req, res) => {
    const students = await knex.from('students').select();
    res.json(students)
});

app.post('/login', async (req, res) => {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
        return res.status(400).json({ error: 'Email, password, and role are required' });
    }
    try {
        if (role === "Admin") {
            if (email === "admin@admin.com" && password === "admin#1947") {
                return res.status(200).json(email);
            } else {
                return res.status(401).json({ error: "Invalid Admin credentials" });
            }
        } else if (role === "Faculty") {
            const faculty = await knex('faculties').where({ email, password }).first();
            if (faculty) {
                return res.status(200).json(email);
            } else {
                return res.status(401).json({ error: "Invalid Faculty credentials" });
            }
        } else if (role === "Student") {
            const student = await knex('students').where({ email, password }).first();
            if (student) {
                return res.status(200).json(email);
            } else {
                return res.status(401).json({ error: "Invalid Student credentials" });
            }
        } else {
            return res.status(400).json({ error: "Invalid role specified" });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Failed to process login' });
    }
});

app.get('/admin/dashboard', async (req, res) => {
    try {
        const students = await knex('students')
        const faculties = await knex('faculties')
        const tasks = await knex('tasks')

        // Return the data as JSON
        res.status(200).json({
            students,
            faculties,
            tasks
        });
    } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

app.delete('/students/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Check if the student exists
        const student = await knex('students').where({ id }).first();
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Delete the student from the database
        await knex('students').where({ id }).del();
        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ error: 'Failed to delete student' });
    }
});

app.put('/students/:id/toggle-active', async (req, res) => {
    const { id } = req.params;

    try {
        // Check if the student exists
        const student = await knex('students').where({ id }).first();
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Toggle the isActive flag
        const newStatus = student.isActive === 0 ? 1 : 0;
        await knex('students').where({ id }).update({ isActive: newStatus });

        res.status(200).json({
            message: `Student ${newStatus === 1 ? 'activated' : 'deactivated'} successfully`,
            isActive: newStatus,
        });
    } catch (error) {
        console.error('Error toggling student status:', error);
        res.status(500).json({ error: 'Failed to toggle student status' });
    }
});

app.post('/faculties', async (req, res) => {
    const { name, mobile, address, email, college, password } = req.body;
    // Validate the request body
    if (!name || !mobile || !address || !email || !college || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    try {
        // Insert the faculty data into the database
        await knex('faculties').insert({
            "id": uuid.v4(),
            "name": name,
            "mobile": mobile,
            "address": address,
            "email": email,
            "college": college,
            "password": password,
            "isActive": 0
        });
        res.status(201).json({ message: 'Faculty created successfully' });
    } catch (error) {
        console.error('Error inserting student:', error);
        res.status(500).json({ error: 'Failed to create faculty' });
    }
});

app.get('/faculties', async (req, res) => {
    const faculties = await knex.from('faculties').select();
    res.json(faculties)
});

app.delete('/faculties/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Check if the faculty exists
        const faculty = await knex('faculties').where({ id }).first();
        if (!faculty) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Delete the faculty from the database
        await knex('faculties').where({ id }).del();
        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Error deleting faculty:', error);
        res.status(500).json({ error: 'Failed to delete faculty' });
    }
});

app.put('/faculties/:id/toggle-active', async (req, res) => {
    const { id } = req.params;

    try {
        // Check if the faculty exists
        const faculty = await knex('faculties').where({ id }).first();
        if (!faculty) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Toggle the isActive flag
        const newStatus = faculty.isActive === 0 ? 1 : 0;
        await knex('faculties').where({ id }).update({ isActive: newStatus });

        res.status(200).json({
            message: `Student ${newStatus === 1 ? 'activated' : 'deactivated'} successfully`,
            isActive: newStatus,
        });
    } catch (error) {
        console.error('Error toggling faculty status:', error);
        res.status(500).json({ error: 'Failed to toggle faculty status' });
    }
});

app.listen(port, () => {
    console.log('App started listening on port: ', port)
});
