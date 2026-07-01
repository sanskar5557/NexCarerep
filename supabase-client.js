const SUPABASE_URL = 'https://ktegzyhgignmbrcjbmbx.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0ZWd6eWhnaWdubWJyY2pibWJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MjUxNTgsImV4cCI6MjA5NTEwMTE1OH0.Gzf-USCdWdgfYfdaUcAKlrKGQGknqVr9GVeE5xqgwzA';

class LocalStorageDatabase {
    constructor() {
        this.init();
    }

    init() {
        // Automatically clean up any existing duplicate "Dr." prefixes in stored data
        try {
            const keys = ['mock_users', 'mock_profiles'];
            keys.forEach(k => {
                const data = localStorage.getItem(k);
                if (data) {
                    const parsed = JSON.parse(data);
                    let changed = false;
                    parsed.forEach(u => {
                        if (u.first_name && u.first_name.toLowerCase().startsWith('dr.')) {
                            u.first_name = u.first_name.substring(3).trim();
                            changed = true;
                        } else if (u.first_name && u.first_name.toLowerCase().startsWith('dr ')) {
                            u.first_name = u.first_name.substring(3).trim();
                            changed = true;
                        }
                    });
                    if (changed) localStorage.setItem(k, JSON.stringify(parsed));
                }
            });

            ['mock_appointments', 'mock_prescriptions'].forEach(k => {
                const data = localStorage.getItem(k);
                if (data) {
                    const parsed = JSON.parse(data);
                    let changed = false;
                    parsed.forEach(item => {
                        if (item.doctor_name && item.doctor_name.toLowerCase().startsWith('dr.')) {
                            item.doctor_name = item.doctor_name.substring(3).trim();
                            changed = true;
                        } else if (item.doctor_name && item.doctor_name.toLowerCase().startsWith('dr ')) {
                            item.doctor_name = item.doctor_name.substring(3).trim();
                            changed = true;
                        }
                    });
                    if (changed) localStorage.setItem(k, JSON.stringify(parsed));
                }
            });
        } catch (e) {
            console.warn("Storage auto-migration warning:", e);
        }

        // Also clean the active session user object
        try {
            const sessionRaw = localStorage.getItem('nexcare_user');
            if (sessionRaw) {
                const su = JSON.parse(sessionRaw);
                let changed = false;
                ['first_name', 'firstName'].forEach(key => {
                    if (su[key] && /^dr[\.\s]/i.test(su[key])) {
                        su[key] = su[key].replace(/^dr[\.\s]+/i, '').trim();
                        changed = true;
                    }
                });
                if (changed) localStorage.setItem('nexcare_user', JSON.stringify(su));
            }
        } catch (e) { /* ignore */ }

        // Seed default doctor profile so user can login with doctor@gmail.com / doctor123 immediately
        if (!localStorage.getItem('mock_users')) {
            localStorage.setItem('mock_users', JSON.stringify([
                {
                    id: 'doc-101',
                    email: 'doctor@gmail.com',
                    password: 'doctor123',
                    first_name: 'John',
                    last_name: 'Doe',
                    role: 'Doctor',
                    speciality: 'Cardiologist',
                    phone: '1234567890',
                    joined: 'June 15, 2026'
                },
                {
                    id: 'pat-101',
                    email: 'patient@gmail.com',
                    password: 'patient123',
                    first_name: 'Jane',
                    last_name: 'Smith',
                    role: 'Patient',
                    phone: '0987654321',
                    joined: 'June 15, 2026'
                }
            ]));
        }

        if (!localStorage.getItem('mock_profiles')) {
            localStorage.setItem('mock_profiles', JSON.stringify([
                {
                    id: 'doc-101',
                    first_name: 'John',
                    last_name: 'Doe',
                    email: 'doctor@gmail.com',
                    role: 'Doctor',
                    speciality: 'Cardiologist',
                    phone: '1234567890',
                    joined: 'June 15, 2026'
                },
                {
                    id: 'pat-101',
                    first_name: 'Jane',
                    last_name: 'Smith',
                    email: 'patient@gmail.com',
                    role: 'Patient',
                    phone: '0987654321',
                    joined: 'June 15, 2026'
                }
            ]));
        }

        if (!localStorage.getItem('mock_appointments')) {
            localStorage.setItem('mock_appointments', JSON.stringify([
                {
                    id: 'appt-101',
                    doctor_email: 'doctor@gmail.com',
                    doctor_name: 'John Doe',
                    patient_email: 'patient@gmail.com',
                    patient_name: 'Jane Smith',
                    patient_initials: 'JS',
                    status: 'Pending',
                    time: '10:00 AM',
                    created_at: new Date().toISOString()
                }
            ]));
        }

        if (!localStorage.getItem('mock_prescriptions')) {
            localStorage.setItem('mock_prescriptions', JSON.stringify([
                {
                    id: 'rx-101',
                    doctor_email: 'doctor@gmail.com',
                    doctor_name: 'John Doe',
                    patient_email: 'patient@gmail.com',
                    patient_name: 'Jane Smith',
                    notes: 'Amoxicillin 500mg - 3 times daily for 7 days.',
                    date: '15 June 2026',
                    created_at: new Date().toISOString()
                }
            ]));
        }
    }

    getCollection(name) {
        return JSON.parse(localStorage.getItem('mock_' + name) || '[]');
    }

    saveCollection(name, data) {
        localStorage.setItem('mock_' + name, JSON.stringify(data));
    }
}

class MockQueryBuilder {
    constructor(db, table) {
        this.db = db;
        this.table = table;
        this.data = db.getCollection(table);
        this.filters = [];
        this.orderCol = null;
        this.orderAscending = true;
        this.isSingle = false;
        this.insertRows = null;
        this.updateData = null;
    }

    select(columns) {
        return this;
    }

    eq(column, value) {
        if (value !== undefined && value !== null) {
            this.filters.push((item) => {
                if (item[column] === undefined) return false;
                return String(item[column]).toLowerCase() === String(value).toLowerCase();
            });
        }
        return this;
    }

    in(column, values) {
        if (Array.isArray(values)) {
            const vals = values.map(v => String(v).toLowerCase());
            this.filters.push((item) => {
                if (item[column] === undefined) return false;
                return vals.includes(String(item[column]).toLowerCase());
            });
        }
        return this;
    }

    order(column, { ascending = true } = {}) {
        this.orderCol = column;
        this.orderAscending = ascending;
        return this;
    }

    single() {
        this.isSingle = true;
        return this;
    }

    insert(rows) {
        this.insertRows = Array.isArray(rows) ? rows : [rows];
        return this;
    }

    update(updates) {
        this.updateData = updates;
        return this;
    }

    async execute() {
        try {
            let result = [...this.data];

            // Apply filters
            for (const filter of this.filters) {
                result = result.filter(filter);
            }

            // Apply sorting
            if (this.orderCol) {
                result.sort((a, b) => {
                    let valA = a[this.orderCol];
                    let valB = b[this.orderCol];
                    if (valA < valB) return this.orderAscending ? -1 : 1;
                    if (valA > valB) return this.orderAscending ? 1 : -1;
                    return 0;
                });
            }

            // Handle insert
            if (this.insertRows) {
                const newRows = this.insertRows.map(row => {
                    const newRow = { 
                        id: row.id || 'id-' + Math.random().toString(36).substring(2, 11),
                        created_at: new Date().toISOString(),
                        ...row 
                    };
                    this.data.push(newRow);
                    return newRow;
                });
                this.db.saveCollection(this.table, this.data);
                return { data: newRows, error: null };
            }

            // Handle update
            if (this.updateData) {
                const allData = this.db.getCollection(this.table);
                const matchingIds = new Set(result.map(r => r.id));
                const updatedItems = [];
                const nextData = allData.map(item => {
                    if (matchingIds.has(item.id)) {
                        const updated = { ...item, ...this.updateData };
                        updatedItems.push(updated);
                        return updated;
                    }
                    return item;
                });
                this.db.saveCollection(this.table, nextData);
                return { data: updatedItems, error: null };
            }

            if (this.isSingle) {
                if (result.length === 0) {
                    return { data: null, error: { message: "No rows found" } };
                }
                return { data: result[0], error: null };
            }

            return { data: result, error: null };
        } catch (err) {
            return { data: null, error: { message: err.message } };
        }
    }

    then(onfulfilled, onrejected) {
        return this.execute().then(onfulfilled, onrejected);
    }
}

class MockAuth {
    constructor(db) {
        this.db = db;
    }

    async signUp({ email, password, options }) {
        try {
            const users = this.db.getCollection('users');
            const normalizedEmail = email.trim().toLowerCase();
            if (users.some(u => u.email === normalizedEmail)) {
                return { data: null, error: { message: "User already exists" } };
            }

            const id = 'user-' + Math.random().toString(36).substring(2, 11);
            const metadata = (options && options.data) || {};
            const newUser = {
                id,
                email: normalizedEmail,
                password,
                first_name: metadata.first_name || '',
                last_name: metadata.last_name || '',
                role: metadata.role || 'Patient'
            };
            users.push(newUser);
            this.db.saveCollection('users', users);

            return { 
                data: { 
                    user: { id, email: normalizedEmail }, 
                    session: { access_token: "mock-session-token" } 
                }, 
                error: null 
            };
        } catch (err) {
            return { data: null, error: { message: err.message } };
        }
    }

    async signInWithPassword({ email, password }) {
        try {
            const users = this.db.getCollection('users');
            const normalizedEmail = email.trim().toLowerCase();
            const user = users.find(u => u.email === normalizedEmail && u.password === password);
            if (!user) {
                return { data: null, error: { message: "Invalid login credentials" } };
            }
            return { 
                data: { 
                    user: { id: user.id, email: user.email }, 
                    session: { access_token: "mock-session-token" } 
                }, 
                error: null 
            };
        } catch (err) {
            return { data: null, error: { message: err.message } };
        }
    }

    async signOut() {
        localStorage.removeItem('nexcare_logged_in');
        localStorage.removeItem('nexcare_user');
        return { error: null };
    }
}

// Check if we are using the default placeholder URL or if Supabase creation fails
const isDefaultOrInvalid = !SUPABASE_URL || 
    SUPABASE_URL.includes('ktegzyhgignmbrcjbmbx') || 
    SUPABASE_URL.includes('YOUR_NEW_SUPABASE_URL');

let client;
if (isDefaultOrInvalid) {
    console.log("Using LocalStorage Mock database because the default Supabase project is inactive/placeholder.");
    const db = new LocalStorageDatabase();
    client = {
        auth: new MockAuth(db),
        from: (table) => new MockQueryBuilder(db, table)
    };
} else {
    try {
        client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
    } catch (e) {
        console.error("Failed to initialize Supabase client, falling back to mock:", e);
        const db = new LocalStorageDatabase();
        client = {
            auth: new MockAuth(db),
            from: (table) => new MockQueryBuilder(db, table)
        };
    }
}

window.supabase = client;

