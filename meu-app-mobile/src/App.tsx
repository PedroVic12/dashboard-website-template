// App.tsx - Arquivo único com todos os componentes
import React, { useState, createContext, useContext, ReactNode, useRef, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
import {
    Box, Snackbar, Alert as MuiAlert, IconButton, Button, AppBar, Toolbar,
    Typography, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    BottomNavigation, BottomNavigationAction, Paper, Modal, Avatar, Switch, Divider,
    Tabs, Tab, Checkbox, FormControlLabel, Card, CardContent, CardMedia, CardActions,
    Grid, CircularProgress, useTheme, CssBaseline
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LanguageIcon from '@mui/icons-material/Language';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { deepmerge } from '@mui/utils';

// --- Toast Notification Context and Provider ---
interface ToastMessage {
    id: number;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
    action?: ReactNode;
}

interface ToastContextType {
    addToast: (message: string, severity: ToastMessage['severity'], action?: ReactNode) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [currentToast, setCurrentToast] = useState<ToastMessage | null>(null);
    const [open, setOpen] = useState(false);

    const addToast = (message: string, severity: ToastMessage['severity'], action?: ReactNode) => {
        const newToast: ToastMessage = { id: Date.now(), message, severity, action };
        setToasts((prevToasts) => [...prevToasts, newToast]);
    };

    useEffect(() => {
        if (toasts.length > 0 && !currentToast) {
            setCurrentToast(toasts[0]);
            setToasts((prev) => prev.slice(1));
            setOpen(true);
        } else if (toasts.length === 0 && open) {
            // If queue is empty but snackbar is open, let it close naturally
        }
    }, [toasts, currentToast, open]);

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    const handleExited = () => {
        setCurrentToast(null); // Ready for the next toast after transition
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            {currentToast && (
                <Snackbar
                    open={open}
                    autoHideDuration={6000}
                    onClose={handleClose}
                    TransitionProps={{ onExited: handleExited }}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <MuiAlert
                        elevation={6}
                        variant="filled"
                        severity={currentToast.severity}
                        onClose={handleClose}
                        action={
                            <>
                                {currentToast.action}
                                <IconButton
                                    size="small"
                                    aria-label="close"
                                    color="inherit"
                                    onClick={handleClose}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </>
                        }
                        sx={{ width: '100%' }}
                    >
                        {currentToast.message}
                    </MuiAlert>
                </Snackbar>
            )}
        </ToastContext.Provider>
    );
};
// --- End Toast Notification Context ---


// --- BottomSheet Component ---
interface BottomSheetProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const bottomSheetStyle = {
    position: 'absolute' as 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    bgcolor: 'background.paper',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    boxShadow: 24,
    p: 3,
    maxHeight: '70vh',
    overflowY: 'auto',
};

const BottomSheet: React.FC<BottomSheetProps> = ({ open, onClose, title, children }) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="bottom-sheet-title"
            aria-describedby="bottom-sheet-description"
        >
            <Box sx={bottomSheetStyle}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography id="bottom-sheet-title" variant="h6" component="h2">
                        {title}
                    </Typography>
                    <IconButton onClick={onClose} aria-label="close">
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Box id="bottom-sheet-description">
                    {children}
                </Box>
                <Box display="flex" justifyContent="flex-end" mt={3}>
                    <Button onClick={onClose} variant="outlined" color="secondary">
                        Cancel
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};
// --- End BottomSheet Component ---

// --- Session Context ---
interface SessionContextType {
    drawerOpen: boolean;
    setDrawerOpen: (open: boolean) => void;
}

const SessionContext = createContext<SessionContextType | null>(null);

const useSession = () => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
};

const SessionProvider = ({ children }: { children: ReactNode }) => {
    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <SessionContext.Provider value={{ drawerOpen, setDrawerOpen }}>
            {children}
        </SessionContext.Provider>
    );
};
// --- End Session Context ---

// --- MainLayout Component ---
interface MainLayoutProps {
    children: ReactNode;
}

const drawerWidth = 240;

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const { drawerOpen, setDrawerOpen } = useSession();
    const navigate = useNavigate();
    const location = useLocation();
    const { palette } = useTheme();

    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    };

    const handleNavigation = (path: string) => {
        navigate(path);
        setDrawerOpen(false);
    };

    const getCurrentTabValue = () => {
        if (location.pathname === '/') return '/';
        if (location.pathname.startsWith('/profile')) return '/profile';
        if (location.pathname.startsWith('/settings')) return '/settings';
        if (location.pathname.startsWith('/workout')) return '/workout';
        return false;
    };

    const currentTabValue = getCurrentTabValue();

    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', width: drawerWidth }}>
            <Typography variant="h6" sx={{ my: 2 }}>
                App Menu
            </Typography>
            <List>
                {[
                    { text: 'Inbox', path: '/inbox', icon: <InboxIcon /> },
                    { text: 'Mail', path: '/mail', icon: <MailIcon /> },
                    { text: 'Home', path: '/', icon: <HomeIcon /> },
                    { text: 'Profile', path: '/profile', icon: <PersonIcon /> },
                    { text: 'Settings', path: '/settings', icon: <SettingsIcon /> },
                    { text: 'Workout', path: '/workout', icon: <FitnessCenterIcon /> },
                ].map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton onClick={() => handleNavigation(item.path)}>
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar position="fixed">
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div">
                        Mobile App
                    </Typography>
                </Toolbar>
            </AppBar>

            <Drawer
                variant="temporary"
                open={drawerOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{ '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
            >
                {drawer}
            </Drawer>

            <Box
                component="main"
                className="flex-grow pt-16 pb-14 overflow-y-auto" // Tailwind padding for AppBar/BottomNav
                sx={{ width: '100%' }}
            >
                {children}
            </Box>

            <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1100 }} elevation={3}>
                <BottomNavigation
                    showLabels
                    value={currentTabValue}
                    onChange={(event, newValue) => {
                        handleNavigation(newValue);
                    }}
                >
                    <BottomNavigationAction label="Home" value="/" icon={<HomeIcon />} />
                    <BottomNavigationAction label="Profile" value="/profile" icon={<PersonIcon />} />
                    <BottomNavigationAction label="Workout" value="/workout" icon={<FitnessCenterIcon />} />
                    <BottomNavigationAction label="Settings" value="/settings" icon={<SettingsIcon />} />
                </BottomNavigation>
            </Paper>
        </Box>
    );
};
// --- End MainLayout Component ---


// --- Page Components ---

// HomePage
const HomePage: React.FC = () => {
    const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
    const { addToast } = useToast();

    const handleOpenBottomSheet = () => setBottomSheetOpen(true);
    const handleCloseBottomSheet = () => setBottomSheetOpen(false);

    const showSuccessToast = () => addToast('Operation successful!', 'success');
    const showErrorToastWithAction = () => {
        addToast('Something went wrong!', 'error', (
            <Button color="inherit" size="small" onClick={() => alert('Retry action clicked!')}>
                RETRY
            </Button>
        ));
    };

    return (
        <Box className="p-4">
            <Typography variant="h4" gutterBottom>Home Page</Typography>
            <Typography paragraph>Welcome to the mobile app template.</Typography>
            <Button variant="contained" onClick={handleOpenBottomSheet} className="mb-4">
                Open Bottom Sheet
            </Button>
            <Box className="space-x-2">
                <Button variant="outlined" color="success" onClick={showSuccessToast}>Show Success Toast</Button>
                <Button variant="outlined" color="error" onClick={showErrorToastWithAction}>Show Error Toast with Action</Button>
            </Box>
            <BottomSheet open={bottomSheetOpen} onClose={handleCloseBottomSheet} title="Example Bottom Sheet">
                <Typography paragraph>This is the bottom sheet content.</Typography>
                <Typography paragraph>It scrolls if needed. Lorem ipsum...</Typography>
                <Button variant="contained" onClick={handleCloseBottomSheet} className="mt-4">Confirm Action</Button>
            </BottomSheet>
        </Box>
    );
};

// ProfilePage
const ProfilePage: React.FC = () => {
    return (
        <Box className="p-4">
            <Typography variant="h4" gutterBottom>Profile</Typography>
            <Paper elevation={3} className="p-6 flex flex-col items-center rounded-lg">
                <Avatar sx={{ width: 80, height: 80, mb: 2 }} alt="User Avatar" src="/static/images/avatar/1.jpg" />
                <Typography variant="h6">John Doe</Typography>
                <Typography color="text.secondary">john.doe@example.com</Typography>
                <Typography variant="body2" className="mt-4 text-center">Profile page content goes here.</Typography>
            </Paper>
        </Box>
    );
};

// SettingsPage
const SettingsPage: React.FC = () => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const { addToast } = useToast();
    const { setThemeMode, themeMode } = useDarkMode();

    const handleNotificationToggle = () => setNotificationsEnabled(!notificationsEnabled);
    const handleDarkModeToggle = () => {
        const newMode = themeMode === 'light' ? 'dark' : 'light';
        setThemeMode(newMode);
        addToast(`Dark mode is now ${newMode}`, 'info');
    };

    return (
        <Box className="p-4">
            <Typography variant="h4" gutterBottom>Settings</Typography>
            <List sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
                <ListItem>
                    <ListItemIcon><NotificationsIcon /></ListItemIcon>
                    <ListItemText primary="Enable Notifications" />
                    <Switch edge="end" onChange={handleNotificationToggle} checked={notificationsEnabled} />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                    <ListItemIcon><DarkModeIcon /></ListItemIcon>
                    <ListItemText primary="Dark Mode" />
                    <Switch
                        edge="end"
                        onChange={handleDarkModeToggle}
                        checked={themeMode === 'dark'}
                    />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                    <ListItemIcon><LanguageIcon /></ListItemIcon>
                    <ListItemText primary="Language" secondary="English" />
                </ListItem>
            </List>
        </Box>
    );
};

// NotFoundPage
const NotFoundPage: React.FC = () => {
    return (
        <Box className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-4 text-center">
            <Typography variant="h1" component="h1" gutterBottom>404</Typography>
            <Typography variant="h5" component="h2" gutterBottom>Page Not Found</Typography>
            <Typography color="text.secondary" paragraph>Sorry, the page does not exist.</Typography>
            <Button variant="contained" component={Link} to="/" className="mt-4">Go to Home</Button>
        </Box>
    );
};
// --- YouTube Video Component ---
interface YouTubeVideoProps {
    videoId: string;
    title: string;
}

const YouTubeVideo: React.FC<YouTubeVideoProps> = ({ videoId, title }) => {
    return (
        <Card sx={{ mb: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardMedia
                component="iframe"
                height={200}
                src={`https://www.youtube.com/embed/${videoId}`}
                title={title}
                frameBorder="0"
                allowFullScreen
                sx={{ border: 0 }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" component="div" noWrap>
                    {title}
                </Typography>
            </CardContent>
        </Card>
    );
};

// --- Exercise Item Component ---
interface ExerciseItemProps {
    name: string;
    checked: boolean;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ExerciseItem: React.FC<ExerciseItemProps> = ({ name, checked, onChange }) => {
    return (
        <FormControlLabel
            control={<Checkbox checked={checked} onChange={onChange} color="primary" />}
            label={name}
            sx={{ width: '100%', mb: 1 }}
        />
    );
};

// --- Carousel Component ---
interface CarouselProps {
    children: ReactNode[];
}

const Carousel: React.FC<CarouselProps> = ({ children }) => {
    const [current, setCurrent] = useState(0);
    const maxIndex = children.length - 1;

    const next = () => {
        setCurrent(current === maxIndex ? 0 : current + 1);
    };

    const prev = () => {
        setCurrent(current === 0 ? maxIndex : current - 1);
    };

    return (
        <Box sx={{ position: 'relative', width: '100%', mt: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                {children[current]}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <IconButton onClick={prev} color="primary">
                    <ArrowBackIcon />
                </IconButton>
                <Typography sx={{ mx: 2, display: 'flex', alignItems: 'center' }}>
                    {current + 1} / {children.length}
                </Typography>
                <IconButton onClick={next} color="primary">
                    <ArrowForwardIcon />
                </IconButton>
            </Box>
        </Box>
    );
};

// --- Workout Content Component ---
interface WorkoutTabContentProps {
    videos: { id: string; title: string }[];
    exercises: string[];
}

const WorkoutTabContent: React.FC<WorkoutTabContentProps> = ({ videos, exercises }) => {
    const [completedExercises, setCompletedExercises] = useState<{ [key: string]: boolean }>(
        exercises.reduce((acc, exercise) => ({ ...acc, [exercise]: false }), {})
    );
    const { addToast } = useToast();

    const handleCheckboxChange = (exercise: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setCompletedExercises({
            ...completedExercises,
            [exercise]: event.target.checked,
        });
    };

    const handleFinishWorkout = () => {
        const allCompleted = Object.values(completedExercises).every(v => v);
        if (allCompleted) {
            addToast('Parabéns! Treino concluído com sucesso!', 'success');
        } else {
            const completedCount = Object.values(completedExercises).filter(v => v).length;
            const totalExercises = exercises.length;
            const percentage = Math.round((completedCount / totalExercises) * 100);

            addToast(`Treino parcialmente concluído: ${percentage}% dos exercícios realizados.`, 'info');
        }
    };

    const progress = Object.values(completedExercises).filter(v => v).length / exercises.length * 100;

    return (
        <Box sx={{ pb: 4 }}>
            {/* Videos Carousel */}
            <Carousel>
                {videos.map((video) => (
                    <YouTubeVideo key={video.id} videoId={video.id} title={video.title} />
                ))}
            </Carousel>

            {/* Exercise Checklist */}
            <Paper sx={{ p: 2, mt: 2 }}>
                <Box display="flex" alignItems="center" mb={2}>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Exercícios
                    </Typography>
                    <CircularProgress
                        variant="determinate"
                        value={progress}
                        size={32}
                        color={progress === 100 ? "success" : "primary"}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        {Math.round(progress)}%
                    </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                    {exercises.map((exercise) => (
                        <ExerciseItem
                            key={exercise}
                            name={exercise}
                            checked={completedExercises[exercise] || false}
                            onChange={handleCheckboxChange(exercise)}
                        />
                    ))}
                </Box>

                <Button
                    variant="contained"
                    fullWidth
                    startIcon={<CheckCircleIcon />}
                    onClick={handleFinishWorkout}
                    color={progress === 100 ? "success" : "primary"}
                >
                    Finalizar Treino
                </Button>
            </Paper>
        </Box>
    );
};

// --- WorkoutPage Component ---
const WorkoutPage: React.FC = () => {
    const [currentTab, setCurrentTab] = useState(0);

    // Workout data
    const workoutData = [
        {
            type: 'Push',
            videos: [
                { id: 'dGpVNgzqMjY', title: 'Treino Push - Peito, Ombro e Tríceps' },
                { id: 'RJ0zxH0tUJM', title: 'Dicas para Treino Push Completo' },
                { id: 'tHD3Y4OjcQg', title: 'Push Workout para Hipertrofia' }
            ],
            exercises: [
                'Supino Reto 4x12',
                'Desenvolvimento com Halteres 3x10',
                'Crucifixo Máquina 3x12',
                'Elevação Lateral 4x15',
                'Tríceps Corda 4x15',
                'Tríceps Francês 3x12'
            ]
        },
        {
            type: 'Pull',
            videos: [
                { id: '7jYIxJVEKMI', title: 'Treino Pull - Costas e Bíceps' },
                { id: 'KSG9bETUzNI', title: 'Pull Workout para Ganho de Massa' },
                { id: 'MgNn2uPXOz4', title: 'Técnicas Avançadas para Pull Day' }
            ],
            exercises: [
                'Puxada Frontal 4x12',
                'Remada Curvada 4x10',
                'Pulldown 3x12',
                'Rosca Direta 4x12',
                'Rosca Martelo 3x12',
                'Remada Unilateral 3x10 (cada lado)'
            ]
        },
        {
            type: 'Abs',
            videos: [
                { id: '1foQY0o8CSc', title: 'Treino Abdominal Completo 10min' },
                { id: 'AnYl6Nk9GOA', title: 'Abdominal Para Iniciantes' },
                { id: 'DHD1-2P94DI', title: 'Core Training para Definição' }
            ],
            exercises: [
                'Crunch Tradicional 3x20',
                'Prancha Frontal 3x30s',
                'Prancha Lateral 3x20s (cada lado)',
                'Elevação de Pernas 3x15',
                'Russian Twist 3x20',
                'Mountain Climber 3x30s'
            ]
        }
    ];

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    };

    return (
        <Box className="p-4">
            <Typography variant="h4" gutterBottom>Treinos</Typography>

            <Paper sx={{ width: '100%', mb: 2 }}>
                <Tabs
                    value={currentTab}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    indicatorColor="primary"
                    textColor="primary"
                    aria-label="workout tabs"
                >
                    {workoutData.map((workout, index) => (
                        <Tab key={index} label={workout.type} />
                    ))}
                </Tabs>
            </Paper>

            {workoutData.map((workout, index) => (
                <Box key={index} role="tabpanel" hidden={currentTab !== index}>
                    {currentTab === index && (
                        <WorkoutTabContent videos={workout.videos} exercises={workout.exercises} />
                    )}
                </Box>
            ))}
        </Box>
    );
};

// --- Dark Mode Context and Theme ---
type ThemeMode = 'light' | 'dark';

interface DarkModeContextType {
    themeMode: ThemeMode;
    setThemeMode:(mode: ThemeMode) => void;
}

const DarkModeContext = createContext<DarkModeContextType | null>(null);

const useDarkMode = () => {
    const context = useContext(DarkModeContext);
    if (!context) {
        throw new Error('useDarkMode must be used within a DarkModeProvider');
    }
    return context;
};

const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#6200EE', // Purple 500
        },
        secondary: {
            main: '#03DAC5', // Teal 300
        },
        background: {
            default: '#F5F5F5', // Gray 100
            paper: '#FFFFFF', // White
        },
        text: {
            primary: 'rgba(0, 0, 0, 0.87)',
            secondary: 'rgba(0, 0, 0, 0.6)',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 4,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 4,
                },
            },
        },
        MuiCard: {
          styleOverrides: {
            root: {
                borderRadius: 8, // More rounded cards
                boxShadow: '0px 1px 3px rgba(0,0,0,0.1)', // Subtle shadow
            }
          }
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#FFFFFF', // White AppBar
                    color: 'rgba(0, 0, 0, 0.87)', // Dark text
                    boxShadow: '0px 2px 4px rgba(0,0,0,0.08)', // Subtle shadow
                },
            },
        },
        MuiBottomNavigation: {
            styleOverrides: {
                root: {
                    backgroundColor: '#FFFFFF', // White Bottom Navigation
                    color: 'rgba(0, 0, 0, 0.6)', // Light text
                    boxShadow: '0px -1px 3px rgba(0,0,0,0.05)',
                },
            },
        },
    },
});

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#BB86FC', // Purple 200
        },
        secondary: {
            main: '#03DAC6', // Teal 200
        },
        background: {
            default: '#121212', // Near Black
            paper: '#1E1E1E', // Dark Gray
        },
        text: {
            primary: '#FFFFFF',
            secondary: 'rgba(255, 255, 255, 0.7)',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
      components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 4,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 4,
                },
            },
        },
        MuiCard: {
          styleOverrides: {
            root: {
                borderRadius: 8, // More rounded cards
                boxShadow: '0px 2px 6px rgba(0,0,0,0.4)', // More pronounced shadow
            }
          }
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#1E1E1E', // Darker AppBar
                    color: '#FFFFFF', // White text
                    boxShadow: '0px 2px 8px rgba(0,0,0,0.3)',
                },
            },
        },
          MuiBottomNavigation: {
            styleOverrides: {
                root: {
                    backgroundColor: '#1E1E1E',
                    color: 'rgba(255, 255, 255, 0.7)',
                    boxShadow: '0px -1px 3px rgba(0,0,0,0.1)',
                },
            },
        },
    },
});

const DarkModeProvider = ({ children }: { children: ReactNode }) => {
    const [themeMode, setThemeMode] = useState<ThemeMode>('light');

    const theme = React.useMemo(
        () =>
            deepmerge(
                themeMode === 'light' ? lightTheme : darkTheme,
                {},
            ),
        [themeMode],
    );

    return (
        <DarkModeContext.Provider value={{ themeMode, setThemeMode }}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </DarkModeContext.Provider>
    );
};

// --- Main App Component ---
const App = () => (
    <DarkModeProvider>
        <SessionProvider>
            <ToastProvider>
                <BrowserRouter>
                    <MainLayout>
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="/settings" element={<SettingsPage />} />
                            <Route path="/workout" element={<WorkoutPage />} />
                            <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                    </MainLayout>
                </BrowserRouter>
            </ToastProvider>
        </SessionProvider>
    </DarkModeProvider>
);

export default App;
