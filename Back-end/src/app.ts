import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { errorHandler } from './utils/error';

// Import routes
import userRoutes from './routes/user.routes';
import barangRoutes from './routes/barang.routes';
import stokRoutes from './routes/stok.routes';
import ambilBarangRoutes from './routes/ambilBarang.routes';
import setorRoutes from './routes/setor.routes';
import keuanganRoutes from './routes/keuangan.routes';
import authRoutes from './routes/auth.routes';

const app: Application = express();

// ============ MIDDLEWARE ============

// CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (development)
if (process.env.NODE_ENV !== 'production') {
    app.use((req: Request, res: Response, next: NextFunction) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
        next();
    });
}

// ============ ROUTES ============

// Health check
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/barang', barangRoutes);
app.use('/api/stok', stokRoutes);
app.use('/api/ambil-barang', ambilBarangRoutes);
app.use('/api/setor', setorRoutes);
app.use('/api/keuangan', keuanganRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.path} not found`,
    });
});

// Global error handler
app.use(errorHandler);

export default app;
