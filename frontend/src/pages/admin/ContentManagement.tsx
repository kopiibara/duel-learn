import * as React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Chip,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SortIcon from '@mui/icons-material/Sort';
import AddIcon from '@mui/icons-material/Add';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`content-tabpanel-${index}`}
      aria-labelledby={`content-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface ContentItem {
  id: string;
  title: string;
  type: 'lesson' | 'quiz' | 'game' | 'challenge';
  subject: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  createdBy: string;
  createdAt: string;
  status: 'published' | 'draft' | 'archived' | 'under review';
  engagement: {
    views: number;
    completions: number;
    averageRating: number;
  };
}

const sampleContentItems: ContentItem[] = [
  {
    id: 'content-001',
    title: 'Introduction to Algebra',
    type: 'lesson',
    subject: 'Mathematics',
    difficulty: 'beginner',
    tags: ['algebra', 'introduction', 'equations'],
    createdBy: 'Admin User',
    createdAt: '2023-08-15',
    status: 'published',
    engagement: {
      views: 1245,
      completions: 856,
      averageRating: 4.7
    }
  },
  {
    id: 'content-002',
    title: 'Advanced Trigonometry',
    type: 'lesson',
    subject: 'Mathematics',
    difficulty: 'advanced',
    tags: ['trigonometry', 'calculus', 'functions'],
    createdBy: 'Math Teacher',
    createdAt: '2023-07-22',
    status: 'published',
    engagement: {
      views: 765,
      completions: 342,
      averageRating: 4.5
    }
  },
  {
    id: 'content-003',
    title: 'Chemistry Basics Quiz',
    type: 'quiz',
    subject: 'Chemistry',
    difficulty: 'beginner',
    tags: ['chemistry', 'elements', 'periodic table'],
    createdBy: 'Science Coordinator',
    createdAt: '2023-09-05',
    status: 'published',
    engagement: {
      views: 2341,
      completions: 1987,
      averageRating: 4.8
    }
  },
  {
    id: 'content-004',
    title: 'Physics Challenge: Forces',
    type: 'challenge',
    subject: 'Physics',
    difficulty: 'intermediate',
    tags: ['physics', 'forces', 'motion'],
    createdBy: 'Admin User',
    createdAt: '2023-08-30',
    status: 'draft',
    engagement: {
      views: 0,
      completions: 0,
      averageRating: 0
    }
  },
  {
    id: 'content-005',
    title: 'Biology Game: Cell Structure',
    type: 'game',
    subject: 'Biology',
    difficulty: 'beginner',
    tags: ['biology', 'cells', 'organelles'],
    createdBy: 'Game Developer',
    createdAt: '2023-07-10',
    status: 'under review',
    engagement: {
      views: 546,
      completions: 421,
      averageRating: 4.3
    }
  },
  {
    id: 'content-006',
    title: 'History Timeline Challenge',
    type: 'challenge',
    subject: 'History',
    difficulty: 'advanced',
    tags: ['history', 'timeline', 'events'],
    createdBy: 'Content Creator',
    createdAt: '2023-09-12',
    status: 'archived',
    engagement: {
      views: 1265,
      completions: 542,
      averageRating: 3.9
    }
  }
];

const ContentManagement: React.FC = () => {
  const [tabValue, setTabValue] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterAnchorEl, setFilterAnchorEl] = React.useState<null | HTMLElement>(null);
  const [sortAnchorEl, setSortAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedContentType, setSelectedContentType] = React.useState<string>('all');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<string>('all');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [currentContent, setCurrentContent] = React.useState<ContentItem | null>(null);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleSortClick = (event: React.MouseEvent<HTMLElement>) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handlePreviewContent = (content: ContentItem) => {
    setCurrentContent(content);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Filter content based on search query and filters
  const filteredContent = sampleContentItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = selectedContentType === 'all' || item.type === selectedContentType;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    const matchesDifficulty = selectedDifficulty === 'all' || item.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesType && matchesStatus && matchesDifficulty;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'published': return 'success';
      case 'draft': return 'default';
      case 'under review': return 'warning';
      case 'archived': return 'error';
      default: return 'default';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Content Management
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => window.location.href = '/admin/create-content'}
        >
          Create New Content
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Content Overview
        </Typography>
        <Typography paragraph>
          Manage all educational content from this centralized dashboard. Create, edit, and organize lessons, quizzes, games, and challenges. Monitor engagement metrics and ensure content quality across all subjects and difficulty levels.
        </Typography>
        
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search by title, tags, or content..."
              variant="outlined"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <Button 
              fullWidth 
              variant="outlined" 
              startIcon={<FilterListIcon />}
              onClick={handleFilterClick}
              sx={{ height: '100%' }}
            >
              Filter
            </Button>
            {filterAnchorEl && (
              <Paper sx={{ 
                position: 'absolute', 
                zIndex: 1, 
                mt: 1, 
                p: 2, 
                minWidth: 300, 
                boxShadow: 3 
              }}>
                <Typography variant="subtitle1" gutterBottom>
                  Filter Content
                </Typography>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="content-type-label">Content Type</InputLabel>
                  <Select
                    labelId="content-type-label"
                    value={selectedContentType}
                    label="Content Type"
                    onChange={(e) => setSelectedContentType(e.target.value)}
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="lesson">Lessons</MenuItem>
                    <MenuItem value="quiz">Quizzes</MenuItem>
                    <MenuItem value="game">Games</MenuItem>
                    <MenuItem value="challenge">Challenges</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    value={selectedStatus}
                    label="Status"
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <MenuItem value="all">All Statuses</MenuItem>
                    <MenuItem value="published">Published</MenuItem>
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="under review">Under Review</MenuItem>
                    <MenuItem value="archived">Archived</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="difficulty-label">Difficulty</InputLabel>
                  <Select
                    labelId="difficulty-label"
                    value={selectedDifficulty}
                    label="Difficulty"
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                  >
                    <MenuItem value="all">All Levels</MenuItem>
                    <MenuItem value="beginner">Beginner</MenuItem>
                    <MenuItem value="intermediate">Intermediate</MenuItem>
                    <MenuItem value="advanced">Advanced</MenuItem>
                  </Select>
                </FormControl>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Button onClick={handleFilterClose}>
                    Cancel
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={handleFilterClose}
                  >
                    Apply Filters
                  </Button>
                </Box>
              </Paper>
            )}
          </Grid>
          <Grid item xs={6} md={2}>
            <Button 
              fullWidth 
              variant="outlined" 
              startIcon={<SortIcon />}
              onClick={handleSortClick}
              sx={{ height: '100%' }}
            >
              Sort
            </Button>
            {sortAnchorEl && (
              <Paper sx={{ 
                position: 'absolute', 
                zIndex: 1, 
                mt: 1, 
                p: 2, 
                minWidth: 200, 
                boxShadow: 3 
              }}>
                <Typography variant="subtitle1" gutterBottom>
                  Sort By
                </Typography>
                <MenuItem onClick={handleSortClose}>Title (A-Z)</MenuItem>
                <MenuItem onClick={handleSortClose}>Title (Z-A)</MenuItem>
                <MenuItem onClick={handleSortClose}>Date Created (Newest)</MenuItem>
                <MenuItem onClick={handleSortClose}>Date Created (Oldest)</MenuItem>
                <MenuItem onClick={handleSortClose}>Most Views</MenuItem>
                <MenuItem onClick={handleSortClose}>Highest Completion Rate</MenuItem>
                <MenuItem onClick={handleSortClose}>Highest Rating</MenuItem>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="content management tabs">
          <Tab label="All Content" id="content-tab-0" />
          <Tab label="Lessons" id="content-tab-1" />
          <Tab label="Quizzes" id="content-tab-2" />
          <Tab label="Games" id="content-tab-3" />
          <Tab label="Challenges" id="content-tab-4" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="content table">
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell align="center">Type</TableCell>
                <TableCell align="center">Subject</TableCell>
                <TableCell align="center">Difficulty</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Engagement</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredContent
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((content) => (
                <TableRow
                  key={content.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <Typography variant="subtitle2">
                      {content.title}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      Created: {content.createdAt} by {content.createdBy}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={content.type.charAt(0).toUpperCase() + content.type.slice(1)} />
                  </TableCell>
                  <TableCell align="center">{content.subject}</TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={content.difficulty.charAt(0).toUpperCase() + content.difficulty.slice(1)} 
                      color={getDifficultyColor(content.difficulty) as "success" | "warning" | "error" | "default"}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={content.status.charAt(0).toUpperCase() + content.status.slice(1)} 
                      color={getStatusColor(content.status) as "success" | "warning" | "error" | "default"}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box>
                      <Typography variant="body2">
                        {content.engagement.views} views
                      </Typography>
                      <Typography variant="body2">
                        {content.engagement.completions} completions
                      </Typography>
                      <Typography variant="body2">
                        {content.engagement.averageRating.toFixed(1)} ★
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => handlePreviewContent(content)}>
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton>
                      <ContentCopyIcon />
                    </IconButton>
                    <IconButton color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredContent.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          {filteredContent
            .filter(item => item.type === 'lesson')
            .map(content => (
            <Grid item xs={12} sm={6} md={4} key={content.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="div">
                    {content.title}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip 
                      size="small" 
                      label={content.subject} 
                      sx={{ mr: 1, mb: 1 }}
                    />
                    <Chip 
                      size="small" 
                      label={content.difficulty.charAt(0).toUpperCase() + content.difficulty.slice(1)} 
                      color={getDifficultyColor(content.difficulty) as "success" | "warning" | "error" | "default"}
                      sx={{ mr: 1, mb: 1 }}
                    />
                    <Chip 
                      size="small" 
                      label={content.status.charAt(0).toUpperCase() + content.status.slice(1)} 
                      color={getStatusColor(content.status) as "success" | "warning" | "error" | "default"}
                      sx={{ mr: 1, mb: 1 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Created: {content.createdAt}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    By: {content.createdBy}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      Views: {content.engagement.views}
                    </Typography>
                    <Typography variant="body2">
                      Completions: {content.engagement.completions}
                    </Typography>
                    <Typography variant="body2">
                      Rating: {content.engagement.averageRating.toFixed(1)} / 5.0
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" startIcon={<VisibilityIcon />} onClick={() => handlePreviewContent(content)}>
                    Preview
                  </Button>
                  <Button size="small" startIcon={<EditIcon />} color="primary">
                    Edit
                  </Button>
                  <IconButton size="small" color="error">
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          {filteredContent
            .filter(item => item.type === 'quiz')
            .map(content => (
            <Grid item xs={12} sm={6} md={4} key={content.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="div">
                    {content.title}
                  </Typography>
                  {/* Same card content as in Lessons tab */}
                  <Box sx={{ mt: 1 }}>
                    <Chip 
                      size="small" 
                      label={content.subject} 
                      sx={{ mr: 1, mb: 1 }}
                    />
                    <Chip 
                      size="small" 
                      label={content.difficulty.charAt(0).toUpperCase() + content.difficulty.slice(1)} 
                      color={getDifficultyColor(content.difficulty) as "success" | "warning" | "error" | "default"}
                      sx={{ mr: 1, mb: 1 }}
                    />
                    <Chip 
                      size="small" 
                      label={content.status.charAt(0).toUpperCase() + content.status.slice(1)} 
                      color={getStatusColor(content.status) as "success" | "warning" | "error" | "default"}
                      sx={{ mr: 1, mb: 1 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Created: {content.createdAt}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    By: {content.createdBy}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      Views: {content.engagement.views}
                    </Typography>
                    <Typography variant="body2">
                      Completions: {content.engagement.completions}
                    </Typography>
                    <Typography variant="body2">
                      Rating: {content.engagement.averageRating.toFixed(1)} / 5.0
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" startIcon={<VisibilityIcon />} onClick={() => handlePreviewContent(content)}>
                    Preview
                  </Button>
                  <Button size="small" startIcon={<EditIcon />} color="primary">
                    Edit
                  </Button>
                  <IconButton size="small" color="error">
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          {filteredContent
            .filter(item => item.type === 'game')
            .map(content => (
            <Grid item xs={12} sm={6} md={4} key={content.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="div">
                    {content.title}
                  </Typography>
                  {/* Same card content as in other tabs */}
                  <Box sx={{ mt: 1 }}>
                    <Chip 
                      size="small" 
                      label={content.subject} 
                      sx={{ mr: 1, mb: 1 }}
                    />
                    <Chip 
                      size="small" 
                      label={content.difficulty.charAt(0).toUpperCase() + content.difficulty.slice(1)} 
                      color={getDifficultyColor(content.difficulty) as "success" | "warning" | "error" | "default"}
                      sx={{ mr: 1, mb: 1 }}
                    />
                    <Chip 
                      size="small" 
                      label={content.status.charAt(0).toUpperCase() + content.status.slice(1)} 
                      color={getStatusColor(content.status) as "success" | "warning" | "error" | "default"}
                      sx={{ mr: 1, mb: 1 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Created: {content.createdAt}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    By: {content.createdBy}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      Views: {content.engagement.views}
                    </Typography>
                    <Typography variant="body2">
                      Completions: {content.engagement.completions}
                    </Typography>
                    <Typography variant="body2">
                      Rating: {content.engagement.averageRating.toFixed(1)} / 5.0
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" startIcon={<VisibilityIcon />} onClick={() => handlePreviewContent(content)}>
                    Preview
                  </Button>
                  <Button size="small" startIcon={<EditIcon />} color="primary">
                    Edit
                  </Button>
                  <IconButton size="small" color="error">
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        <Grid container spacing={3}>
          {filteredContent
            .filter(item => item.type === 'challenge')
            .map(content => (
            <Grid item xs={12} sm={6} md={4} key={content.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="div">
                    {content.title}
                  </Typography>
                  {/* Same card content as in other tabs */}
                  <Box sx={{ mt: 1 }}>
                    <Chip 
                      size="small" 
                      label={content.subject} 
                      sx={{ mr: 1, mb: 1 }}
                    />
                    <Chip 
                      size="small" 
                      label={content.difficulty.charAt(0).toUpperCase() + content.difficulty.slice(1)} 
                      color={getDifficultyColor(content.difficulty) as "success" | "warning" | "error" | "default"}
                      sx={{ mr: 1, mb: 1 }}
                    />
                    <Chip 
                      size="small" 
                      label={content.status.charAt(0).toUpperCase() + content.status.slice(1)} 
                      color={getStatusColor(content.status) as "success" | "warning" | "error" | "default"}
                      sx={{ mr: 1, mb: 1 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Created: {content.createdAt}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    By: {content.createdBy}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      Views: {content.engagement.views}
                    </Typography>
                    <Typography variant="body2">
                      Completions: {content.engagement.completions}
                    </Typography>
                    <Typography variant="body2">
                      Rating: {content.engagement.averageRating.toFixed(1)} / 5.0
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" startIcon={<VisibilityIcon />} onClick={() => handlePreviewContent(content)}>
                    Preview
                  </Button>
                  <Button size="small" startIcon={<EditIcon />} color="primary">
                    Edit
                  </Button>
                  <IconButton size="small" color="error">
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Content Preview Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentContent?.title}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            X
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 2 }}>
            <Chip 
              label={currentContent?.type.charAt(0).toUpperCase() + currentContent?.type.slice(1)} 
              sx={{ mr: 1 }}
            />
            <Chip 
              label={currentContent?.subject} 
              sx={{ mr: 1 }}
            />
            <Chip 
              label={currentContent?.difficulty.charAt(0).toUpperCase() + currentContent?.difficulty.slice(1)} 
              color={currentContent ? getDifficultyColor(currentContent.difficulty) as "success" | "warning" | "error" | "default" : "default"}
              sx={{ mr: 1 }}
            />
            <Chip 
              label={currentContent?.status.charAt(0).toUpperCase() + currentContent?.status.slice(1)} 
              color={currentContent ? getStatusColor(currentContent.status) as "success" | "warning" | "error" | "default" : "default"}
            />
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            Created by {currentContent?.createdBy} on {currentContent?.createdAt}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Content Details
          </Typography>
          
          <Typography paragraph>
            This is a preview of "{currentContent?.title}". The actual content would be displayed here, including text, images, videos, questions, or interactive elements depending on the content type.
          </Typography>

          <Typography paragraph>
            For this {currentContent?.type} content, students will learn about topics related to {currentContent?.subject} at a {currentContent?.difficulty} level.
          </Typography>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Engagement Metrics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4">{currentContent?.engagement.views}</Typography>
                  <Typography variant="body2">Total Views</Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4">{currentContent?.engagement.completions}</Typography>
                  <Typography variant="body2">Completions</Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4">{currentContent?.engagement.averageRating.toFixed(1)}</Typography>
                  <Typography variant="body2">Avg. Rating (out of 5)</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tags
            </Typography>
            <Box>
              {currentContent?.tags.map(tag => (
                <Chip key={tag} label={tag} sx={{ mr: 1, mb: 1 }} />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          <Button variant="outlined" startIcon={<EditIcon />} color="primary">
            Edit Content
          </Button>
          <Button variant="contained" color="primary">
            Publish Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContentManagement; 