export const labourers = [
    {
        id: 1,
        name: "Kwame Mensah",
        profession: "Carpenter",
        location: "Accra",
        rating: 4.8,
        reviews: 24,
        hourlyRate: 50,
        image: "https://randomuser.me/api/portraits/men/1.jpg",
        skills: ["Furniture Repair", "Cabinet Making", "Roofing"],
        verified: true,
        experience: "5+ years",
        bio: "Experienced carpenter specializing in custom furniture and home renovations. I take pride in delivering high-quality craftsmanship and ensuring customer satisfaction.",
        reviewsList: [
            { id: 101, user: "Abena K.", rating: 5, comment: "Kwame did an excellent job fixing my kitchen cabinets. Very professional!", date: "2 days ago" },
            { id: 102, user: "Kojo B.", rating: 4, comment: "Good work, but arrived a bit late. The finish was perfect though.", date: "1 week ago" }
        ]
    },
    {
        id: 2,
        name: "Samuel Osei",
        profession: "Electrician",
        location: "Kumasi",
        rating: 4.9,
        reviews: 42,
        hourlyRate: 60,
        image: "https://randomuser.me/api/portraits/men/3.jpg",
        skills: ["Wiring", "Appliance Repair", "Solar Installation"],
        verified: true,
        experience: "8 years",
        bio: "Certified electrician with a focus on safety and efficiency. I handle everything from simple repairs to complex solar installations.",
        reviewsList: [
            { id: 201, user: "Yaw D.", rating: 5, comment: "Fixed my electrical fault in minutes. highly recommended.", date: "3 weeks ago" }
        ]
    },
    {
        id: 3,
        name: "Emmanuel Asare",
        profession: "Plumber",
        location: "Accra",
        rating: 4.7,
        reviews: 18,
        hourlyRate: 45,
        image: "https://randomuser.me/api/portraits/men/5.jpg",
        skills: ["Pipe Fitting", "Leak Repair", "Bathroom Installation"],
        verified: true,
        experience: "4 years",
        bio: "Professional plumber available for emergency repairs and installations. I ensure your plumbing systems run smoothly.",
        reviewsList: []
    },
    {
        id: 4,
        name: "John Tetteh",
        profession: "Mason",
        location: "Tema",
        rating: 4.6,
        reviews: 15,
        hourlyRate: 55,
        image: "https://randomuser.me/api/portraits/men/7.jpg",
        skills: ["Bricklaying", "Concrete", "Tiling"],
        verified: false,
        experience: "6 years",
        bio: "Skilled mason with expertise in foundation work and tiling. Dedicated to building strong structures.",
        reviewsList: []
    },
    {
        id: 5,
        name: "Daniel Owusu",
        profession: "Painter",
        location: "Accra",
        rating: 4.9,
        reviews: 31,
        hourlyRate: 40,
        image: "https://randomuser.me/api/portraits/men/9.jpg",
        skills: ["Interior Painting", "Exterior Painting", "Wall Treatment"],
        verified: true,
        experience: "7 years",
        bio: "Passionate painter who brings life to your walls. I use high-quality materials for a lasting finish.",
        reviewsList: []
    },
    {
        id: 6,
        name: "Isaac Boateng",
        profession: "Carpenter",
        location: "Kumasi",
        rating: 4.5,
        reviews: 12,
        hourlyRate: 45,
        image: "https://randomuser.me/api/portraits/men/11.jpg",
        skills: ["Door Installation", "Window Frames"],
        verified: true,
        experience: "3 years",
        bio: "Detail-oriented carpenter ready for your door and window installation needs.",
        reviewsList: []
    },
    {
        id: 7,
        name: "Michael Addo",
        profession: "Electrician",
        location: "Accra",
        rating: 4.8,
        reviews: 28,
        hourlyRate: 65,
        image: "https://randomuser.me/api/portraits/men/13.jpg",
        skills: ["Fault Finding", "Generator Installation"],
        verified: true,
        experience: "10+ years",
        bio: "Expert electrician with over a decade of experience. Specializing in industrial and residential electrical systems.",
        reviewsList: []
    },
    {
        id: 8,
        name: "Francis Koomson",
        profession: "Plumber",
        location: "Takoradi",
        rating: 4.4,
        reviews: 9,
        hourlyRate: 40,
        image: "https://randomuser.me/api/portraits/men/15.jpg",
        skills: ["Drainage", "Water Pump Repair"],
        verified: false,
        experience: "2 years",
        bio: "Reliable plumber for all your drainage and water pump issues.",
        reviewsList: []
    }
];

export const professions = [
    "All", "Carpenter", "Electrician", "Plumber", "Mason", "Painter"
];

export const locations = [
    "All", "Accra", "Kumasi", "Tema", "Takoradi"
];
