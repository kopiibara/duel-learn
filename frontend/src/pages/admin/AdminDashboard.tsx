import * as React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Divider, 
  IconButton,
  LinearProgress,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SchoolIcon from '@mui/icons-material/School';
import QuizIcon from '@mui/icons-material/Quiz';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HelpIcon from '@mui/icons-material/Help';
import SecurityIcon from '@mui/icons-material/Security';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Sample data for charts and statistics
const userStatisticsData = [
  { name: 'Jan', active: 400, new: 240 },
  { name: 'Feb', active: 430, new: 220 },
  { name: 'Mar', active: 470, new: 250 },
  { name: 'Apr', active: 510, new: 230 },
  { name: 'May', active: 540, new: 260 },
  { name: 'Jun', active: 580, new: 290 },
  { name: 'Jul', active: 620, new: 270 },
];

const userTypeData = [
  { name: 'Students', value: 70 },
  { name: 'Teachers', value: 15 },
  { name: 'Parents', value: 12 },
  { name: 'Admins', value: 3 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const recentActivityData = [
  {
    id: 1,
    type: 'user',
    title: 'New User Registration',
    description: 'Emily Johnson registered as a new teacher.',
    time: '10 minutes ago',
    icon: <PersonAddIcon />,
    color: '#0088FE'
  },
  {
    id: 2,
    type: 'content',
    title: 'Content Published',
    description: 'Advanced Mathematics course was published by Mark Wilson.',
    time: '45 minutes ago',
    icon: <MenuBookIcon />,
    color: '#00C49F'
  },
  {
    id: 3,
    type: 'system',
    title: 'System Alert',
    description: 'High server load detected. Performance may be affected.',
    time: '2 hours ago',
    icon: <WarningIcon />,
    color: '#FF8042'
  },
  {
    id: 4,
    type: 'user',
    title: 'User Achievement',
    description: 'John Smith completed 10 courses and earned a Gold badge.',
    time: '5 hours ago',
    icon: <SchoolIcon />,
    color: '#FFBB28'
  },
  {
    id: 5,
    type: 'system',
    title: 'Backup Completed',
    description: 'Weekly database backup completed successfully.',
    time: '6 hours ago',
    icon: <CheckCircleIcon />,
    color: '#00C49F'
  },
];

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom component="h1">
        Admin Dashboard
      </Typography>
      <Typography variant="subtitle1" gutterBottom color="text.secondary">
        Welcome to your admin control center. Monitor system health, user activity, and content performance.
      </Typography>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4, mt: 1 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                Total Users
              </Typography>
              <Avatar sx={{ bgcolor: '#0088FE', width: 32, height: 32 }}>
                <PeopleIcon fontSize="small" />
              </Avatar>
            </Box>
            <Typography component="p" variant="h4" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
              1,642
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUpIcon sx={{ color: 'success.main', mr: 1, fontSize: 18 }} />
              <Typography variant="body2" color="success.main">
                +12% from last month
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                Content Items
              </Typography>
              <Avatar sx={{ bgcolor: '#00C49F', width: 32, height: 32 }}>
                <MenuBookIcon fontSize="small" />
              </Avatar>
            </Box>
            <Typography component="p" variant="h4" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
              853
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUpIcon sx={{ color: 'success.main', mr: 1, fontSize: 18 }} />
              <Typography variant="body2" color="success.main">
                +8% from last month
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                Course Completions
              </Typography>
              <Avatar sx={{ bgcolor: '#FFBB28', width: 32, height: 32 }}>
                <SchoolIcon fontSize="small" />
              </Avatar>
            </Box>
            <Typography component="p" variant="h4" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
              3,427
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUpIcon sx={{ color: 'success.main', mr: 1, fontSize: 18 }} />
              <Typography variant="body2" color="success.main">
                +15% from last month
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                Quiz Submissions
              </Typography>
              <Avatar sx={{ bgcolor: '#FF8042', width: 32, height: 32 }}>
                <QuizIcon fontSize="small" />
              </Avatar>
            </Box>
            <Typography component="p" variant="h4" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
              7,842
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingDownIcon sx={{ color: 'error.main', mr: 1, fontSize: 18 }} />
              <Typography variant="body2" color="error.main">
                -3% from last month
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* System Health */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          System Health
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Server Load</Typography>
                <Typography variant="body2" color="text.secondary">68%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={68} color="warning" sx={{ height: 8, borderRadius: 5 }} />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Database Performance</Typography>
                <Typography variant="body2" color="text.secondary">92%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={92} color="success" sx={{ height: 8, borderRadius: 5 }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Storage Capacity</Typography>
                <Typography variant="body2" color="text.secondary">45%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={45} color="info" sx={{ height: 8, borderRadius: 5 }} />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body1" fontWeight="medium">Active Servers</Typography>
                  <Typography variant="body2" color="text.secondary">All servers operational</Typography>
                </Box>
                <Chip label="Healthy" color="success" size="small" />
              </Box>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body1" fontWeight="medium">API Status</Typography>
                  <Typography variant="body2" color="text.secondary">All endpoints responding normally</Typography>
                </Box>
                <Chip label="Operational" color="success" size="small" />
              </Box>
            </Box>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body1" fontWeight="medium">Backup Status</Typography>
                  <Typography variant="body2" color="text.secondary">Last backup: 6 hours ago</Typography>
                </Box>
                <Chip label="Up to Date" color="success" size="small" />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Charts and Activity */}
      <Grid container spacing={4}>
        {/* User Statistics Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              User Growth Statistics
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={userStatisticsData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="active" name="Active Users" fill="#0088FE" />
                <Bar dataKey="new" name="New Users" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* User Distribution Pie Chart */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              User Distribution
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {userTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Recent Activity
              </Typography>
              <Button variant="text" size="small">
                View All
              </Button>
            </Box>
            <List>
              {recentActivityData.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ListItem
                    alignItems="flex-start"
                    secondaryAction={
                      <IconButton edge="end" aria-label="more">
                        <MoreVertIcon />
                      </IconButton>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: activity.color }}>
                        {activity.icon}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={activity.title}
                      secondary={
                        <React.Fragment>
                          <Typography
                            sx={{ display: 'inline' }}
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {activity.description}
                          </Typography>
                          {" — "}{activity.time}
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                  {index < recentActivityData.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6} md={4}>
                <Card 
                  sx={{ 
                    textAlign: 'center', 
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': { transform: 'translateY(-5px)', boxShadow: 3 }
                  }}
                  onClick={() => handleNavigate('/admin/user-management')}
                >
                  <CardContent>
                    <Avatar sx={{ bgcolor: '#0088FE', margin: '0 auto', mb: 1 }}>
                      <PeopleIcon />
                    </Avatar>
                    <Typography variant="body1">
                      User Management
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={4}>
                <Card 
                  sx={{ 
                    textAlign: 'center', 
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': { transform: 'translateY(-5px)', boxShadow: 3 }
                  }}
                  onClick={() => handleNavigate('/admin/content-management')}
                >
                  <CardContent>
                    <Avatar sx={{ bgcolor: '#00C49F', margin: '0 auto', mb: 1 }}>
                      <MenuBookIcon />
                    </Avatar>
                    <Typography variant="body1">
                      Content Management
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={4}>
                <Card 
                  sx={{ 
                    textAlign: 'center', 
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': { transform: 'translateY(-5px)', boxShadow: 3 }
                  }}
                  onClick={() => handleNavigate('/admin/create-content')}
                >
                  <CardContent>
                    <Avatar sx={{ bgcolor: '#FFBB28', margin: '0 auto', mb: 1 }}>
                      <QuizIcon />
                    </Avatar>
                    <Typography variant="body1">
                      Create Content
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={4}>
                <Card 
                  sx={{ 
                    textAlign: 'center', 
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': { transform: 'translateY(-5px)', boxShadow: 3 }
                  }}
                  onClick={() => handleNavigate('/admin/settings')}
                >
                  <CardContent>
                    <Avatar sx={{ bgcolor: '#FF8042', margin: '0 auto', mb: 1 }}>
                      <SettingsIcon />
                    </Avatar>
                    <Typography variant="body1">
                      Settings
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={4}>
                <Card 
                  sx={{ 
                    textAlign: 'center', 
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': { transform: 'translateY(-5px)', boxShadow: 3 }
                  }}
                  onClick={() => handleNavigate('/admin/notifications')}
                >
                  <CardContent>
                    <Avatar sx={{ bgcolor: '#4CAF50', margin: '0 auto', mb: 1 }}>
                      <NotificationsIcon />
                    </Avatar>
                    <Typography variant="body1">
                      Notifications
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} md={4}>
                <Card 
                  sx={{ 
                    textAlign: 'center', 
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': { transform: 'translateY(-5px)', boxShadow: 3 }
                  }}
                  onClick={() => handleNavigate('/admin/support')}
                >
                  <CardContent>
                    <Avatar sx={{ bgcolor: '#9C27B0', margin: '0 auto', mb: 1 }}>
                      <HelpIcon />
                    </Avatar>
                    <Typography variant="body1">
                      Support
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;