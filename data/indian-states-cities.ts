// Indian States, Cities, and Exam Types Data

export type IndianState =
  | "Andhra Pradesh"
  | "Arunachal Pradesh"
  | "Assam"
  | "Bihar"
  | "Chhattisgarh"
  | "Goa"
  | "Gujarat"
  | "Haryana"
  | "Himachal Pradesh"
  | "Jharkhand"
  | "Karnataka"
  | "Kerala"
  | "Madhya Pradesh"
  | "Maharashtra"
  | "Manipur"
  | "Meghalaya"
  | "Mizoram"
  | "Nagaland"
  | "Odisha"
  | "Punjab"
  | "Rajasthan"
  | "Sikkim"
  | "Tamil Nadu"
  | "Telangana"
  | "Tripura"
  | "Uttar Pradesh"
  | "Uttarakhand"
  | "West Bengal";

export const INDIAN_STATES: IndianState[] = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

export const CITIES_BY_STATE: Record<IndianState, string[]> = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Hyderabad"],
  "Arunachal Pradesh": ["Itanagar", "Guwahati"],
  Assam: ["Guwahati", "Silchar", "Dibrugarh"],
  Bihar: ["Patna", "Gaya", "Bhagalpur"],
  Chhattisgarh: ["Raipur", "Bilaspur", "Durg"],
  Goa: ["Panaji", "Margao"],
  Gujarat: ["Ahmedabad", "Vadodara", "Surat", "Rajkot"],
  Haryana: ["Gurgaon", "Faridabad", "Hisar"],
  "Himachal Pradesh": ["Shimla", "Mandi", "Solan"],
  Jharkhand: ["Ranchi", "Dhanbad", "Giridih"],
  Karnataka: ["Bangalore", "Mysore", "Mangalore", "Belgaum"],
  Kerala: ["Kochi", "Thiruvananthapuram", "Kozhikode"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior"],
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Aurangabad"],
  Manipur: ["Imphal"],
  Meghalaya: ["Shillong"],
  Mizoram: ["Aizawl"],
  Nagaland: ["Kohima"],
  Odisha: ["Bhubaneswar", "Cuttack", "Rourkela"],
  Punjab: ["Chandigarh", "Ludhiana", "Amritsar"],
  Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Bikaner"],
  Sikkim: ["Gangtok"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem"],
  Telangana: ["Hyderabad", "Warangal"],
  Tripura: ["Agartala"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut"],
  Uttarakhand: ["Dehradun", "Nainital"],
  "West Bengal": ["Kolkata", "Darjeeling", "Siliguri"],
};

export const EXAM_TYPES = [
  { value: "NATA", label: "NATA (National Aptitude Test in Architecture)" },
  { value: "JEE Paper 2", label: "JEE Paper 2 (B.Arch)" },
];

export const CENTER_STATUS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "discontinued", label: "Discontinued" },
];
