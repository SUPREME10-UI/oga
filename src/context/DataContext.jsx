import { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
    // Initialize state from localStorage if available, else empty arrays
    const [jobs, setJobs] = useState(() => {
        const savedJobs = localStorage.getItem('oga_jobs');
        return savedJobs ? JSON.parse(savedJobs) : [];
    });

    const [labourers, setLabourers] = useState(() => {
        const savedLabourers = localStorage.getItem('oga_labourers');
        return savedLabourers ? JSON.parse(savedLabourers) : [];
    });

    // Update localStorage whenever state changes
    useEffect(() => {
        localStorage.setItem('oga_jobs', JSON.stringify(jobs));
    }, [jobs]);

    useEffect(() => {
        localStorage.setItem('oga_labourers', JSON.stringify(labourers));
    }, [labourers]);

    const addJob = (job) => {
        const newJob = {
            ...job,
            id: Date.now(),
            date: new Date().toLocaleDateString(), // Simple date format
            status: 'Active'
        };
        setJobs(prevJobs => [newJob, ...prevJobs]);
        return newJob;
    };

    const addLabourer = (labourer) => {
        const newLabourer = {
            ...labourer,
            id: Date.now(),
            rating: 0, // Start with 0 rating
            reviewCount: 0
        };
        setLabourers(prevLabourers => [newLabourer, ...prevLabourers]);
        return newLabourer;
    };

    return (
        <DataContext.Provider value={{ jobs, labourers, addJob, addLabourer }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    return useContext(DataContext);
}
