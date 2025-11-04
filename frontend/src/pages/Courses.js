import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import CourseCard from '../components/CourseCard';
import { FaSearch, FaFilter } from 'react-icons/fa';
import '../styles/Courses.css';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    level: searchParams.get('level') || '',
    sort: searchParams.get('sort') || 'popular'
  });

  const categories = ['Technology', 'Business', 'Design', 'Marketing', 'Health', 'Language', 'Science', 'Arts', 'Other'];
  const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
  const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' }
  ];

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.level) queryParams.append('level', filters.level);
      if (filters.sort) queryParams.append('sort', filters.sort);

      const response = await api.get(`/courses?${queryParams.toString()}`);
      setCourses(response.data.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Update URL params
    const newParams = new URLSearchParams();
    Object.keys(newFilters).forEach(k => {
      if (newFilters[k]) newParams.set(k, newFilters[k]);
    });
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      level: '',
      sort: 'popular'
    });
    setSearchParams({});
  };

  return (
    <div className="courses-page">
      <div className="courses-header">
        <div className="container">
          <h1>Explore Courses</h1>
          <p>Discover your next learning adventure</p>
        </div>
      </div>

      <div className="container">
        <div className="courses-content">
          {/* Filters Sidebar */}
          <aside className="filters-sidebar">
            <div className="filters-header">
              <h3><FaFilter /> Filters</h3>
              {(filters.category || filters.level || filters.search) && (
                <button onClick={clearFilters} className="clear-filters">
                  Clear All
                </button>
              )}
            </div>

            <div className="filter-group">
              <label>Search</label>
              <div className="search-box">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  aria-label="Search courses"
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Category</label>
              <select 
                value={filters.category} 
                onChange={(e) => handleFilterChange('category', e.target.value)}
                aria-label="Filter by category"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Level</label>
              <select 
                value={filters.level} 
                onChange={(e) => handleFilterChange('level', e.target.value)}
                aria-label="Filter by level"
              >
                <option value="">All Levels</option>
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Sort By</label>
              <select 
                value={filters.sort} 
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                aria-label="Sort courses"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </aside>

          {/* Courses Grid */}
          <div className="courses-main">
            {loading ? (
              <>
                <div className="courses-count">
                  <div className="skeleton-line" style={{ width: '180px', height: '18px' }} />
                </div>
                <div className="courses-skeleton-grid">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="skeleton-tile" />
                  ))}
                </div>
              </>
            ) : courses.length > 0 ? (
              <>
                <div className="courses-count">
                  <p>Showing {courses.length} course{courses.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="courses-grid">
                  {courses.map(course => (
                    <CourseCard key={course._id} course={course} />
                  ))}
                </div>
              </>
            ) : (
              <div className="no-courses">
                <h3>No courses found</h3>
                <p>Try adjusting your filters or search terms</p>
                <button onClick={clearFilters} className="btn btn-primary">
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courses;

