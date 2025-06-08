// List of clients with their associated news keywords
const publicationCoverageKeyword = 'All Publications Coverage';
const publicationList = [
  'Eenadu', 'Sakshi', 'Andhra Jyothi', 'Namaste Telangana', 'Prajashakti',
  'The Times of India', 'The Hindu', 'Deccan Chronicle', 'The New Indian Express',
  'Telangana Today', 'The Hans India', 'The Metro India', 'The Pioneer',
  'PTI', 'UNI', 'IANS', 'ANI', 'AFP', 'Outlook', 'The Week', 'Business Today',
  'India Today', 'Business World', 'Business india', 'Economic Times',
  'HT Mint', 'Business Standard', 'Financial Express', 'Bizz Buzz',
  'Free Press Journal', 'Money Control', 'Your Story', 'Inc42'
];

const clients = [
  {
    id: 1,
    name: "Ashoka One Mall",
    industry: "Retail/Real Estate",
    keywords: [
      "Hyderabad retail real estate",
      "retail trends Telangana",
      "shopping mall news India",
      "F&B retail India",
      "Inorbit Mall",
      "Forum Mall",
      "GSM Mall",
      "Sarath City Capital Mall",
      "Next Galleria Mall",
      "GVK One Mall",
      "City Center Mall",
      "Manjeera Mall",
      "SLN Terminus Mall",
      "L&T Mall",
      "Central Mall Hyderabad"
    ]
  },
  {
    id: 2,
    name: "Adani Gangavaram Port Limited",
    industry: "Ports & Logistics",
    keywords: [
      "Gangavaram Port news",
      "Adani Ports Andhra Pradesh",
      "India port infrastructure",
      "East coast port development",
      "cargo handling statistics India",
      "JSW ports",
      "Krishnapatnam port",
      "Mundra port",
      "Visakhapatnam port",
      "Kakinada port",
      "DP World ports India",
      "port logistics crisis",
      "shipping container shortage",
      "port workers strike",
      "maritime safety standards"
    ]
  },
  {
    id: 3,
    name: "Adani Krishnapatnam Port Limited",
    industry: "Ports & Logistics",
    keywords: [
      "Krishnapatnam Port updates",
      "Adani logistics expansion",
      "AP maritime infrastructure",
      "port-led development India",
      "container traffic India",
      "Chennai Port",
      "Ennore Port",
      "Kakinada Port",
      "Tuticorin Port",
      "Visakhapatnam Port",
      "Machilipatnam Port",
      "Gangavaram Port"
    ]
  },
  {
    id: 4,
    name: "Freedom Healthy Cooking Oils (GEF India)",
    industry: "FMCG/Food",
    keywords: [
      "edible oil market India",
      "healthy cooking oil trends",
      "GEF India news",
      "FMCG India food products",
      "sunflower oil imports India",
      "Fortune Oils",
      "Saffola",
      "Dhara Oils",
      "Gemini Cooking Oils",
      "Patanjali Edible Oils",
      "Cargill India",
      "Sundrop Oils",
      "Emami Agrotech",
      "Ruchi Soya",
      "Adani Wilmar"
    ]
  },
  {
    id: 5,
    name: "Jai Raj Ispat Limited",
    industry: "Steel & Manufacturing",
    keywords: [
      "steel industry India",
      "TMT bars Telangana",
      "Jai Raj Ispat news",
      "infrastructure steel demand India",
      "BIS steel certification India",
      "JSW Steel",
      "SAIL",
      "Tata Steel",
      "RINL Vizag Steel",
      "Jindal Steel",
      "Essar Steel",
      "VISA Steel",
      "ArcelorMittal Nippon Steel",
      "Bhushan Steel",
      "Shyam Steel"
    ]
  },
  {
    id: 6,
    name: "CREDAI Hyderabad",
    industry: "Real Estate Developers Association",
    keywords: [
      "Hyderabad real estate trends",
      "CREDAI Hyderabad updates",
      "housing sector Telangana",
      "urban development India",
      "RERA Hyderabad",
      "Prestige Group",
      "Lodha Group",
      "DLF Limited",
      "Brigade Group",
      "Sobha Developers",
      "Godrej Properties",
      "Ramky Infrastructure",
      "My Home Group",
      "Aparna Constructions",
      "Shathabdi Group",
      "Vasavi Group"
    ]
  },
  {
    id: 7,
    name: "Hyatt Hyderabad Gachibowli",
    industry: "Hospitality",
    keywords: [
      "Hyatt India news",
      "Hyderabad hotel industry",
      "luxury hotel trends India",
      "Gachibowli tourism",
      "hospitality sector recovery India",
      "Marriott Hyderabad",
      "Novotel HICC",
      "ITC Kohenur",
      "Westin Mindspace",
      "Park Hyatt Hyderabad",
      "Taj Krishna",
      "Trident Hyderabad",
      "Radisson Hyderabad",
      "hotel occupancy rates Hyderabad",
      "MICE tourism Telangana",
      "business travel Hyderabad"
    ]
  },
  {
    id: 8,
    name: "Mercure Hyderabad KCP",
    industry: "Hospitality",
    keywords: [
      "Accor Group India",
      "Mercure hotels news",
      "Hyderabad hotel market",
      "midscale hotel trends India",
      "travel and tourism Hyderabad",
      "Novotel Hyderabad",
      "ibis Hyderabad",
      "Fairfield by Marriott",
      "Courtyard by Marriott",
      "Holiday Inn Express",
      "Lemon Tree Hotels",
      "Fortune Hotels",
      "Taj Deccan",
      "Vivanta Hyderabad",
      "Park Inn by Radisson"
    ]
  },
  {
    id: 9,
    name: "Ankura Hospital",
    industry: "Healthcare",
    keywords: [
      "Ankura Hospital news",
      "women health India",
      "children health India",
      "Hyderabad hospital updates",
      "healthcare innovation India",
      "private hospitals Telangana",
      "Apollo Hospital",
      "Kamineni Hospital",
      "Care Hospitals",
      "KIMS Hospital",
      "Yashoda Hospitals",
      "Rainbow Children's Hospital",
      "Fernandez Hospital",
      "maternity services Hyderabad",
      "pediatric healthcare Telangana",
      "hospital crisis"
    ]
  },
  {
    id: 10,
    name: "Telangana Life Sciences",
    industry: "Biotech/Pharma Cluster",
    keywords: [
      "Telangana pharma cluster",
      "life sciences news Hyderabad",
      "biotech investments Telangana",
      "Genome Valley Hyderabad",
      "pharma exports India",
      "Dr Reddy's Labs",
      "Aurobindo Pharma",
      "Hetero Labs",
      "Mylan Laboratories",
      "Biological E",
      "Bharat Biotech",
      "Divis Laboratories",
      "Natco Pharma",
      "Laurus Labs",
      "Shantha Biotechnics",
      "Indian Immunologicals"
    ]
  },
  {
    id: 11,
    name: "Zithara AI",
    industry: "Tech/AI/Fintech",
    keywords: [
      "Zithara AI news",
      "AI startups India",
      "fintech innovation Hyderabad",
      "digital payments trends",
      "AI in retail India",
      "Fractal Analytics",
      "SigTuple",
      "Haptik AI",
      "Razorpay",
      "Pine Labs",
      "Perfios",
      "MuSigma",
      "ThoughtSpot",
      "Absentia VR",
      "Netradyne",
      "Locus AI"
    ]
  },
  {
    id: 12,
    name: "Premia Academy",
    industry: "Education/Schools",
    keywords: [
      "international schools Hyderabad",
      "CBSE/IB curriculum India",
      "education sector Telangana",
      "EdTech India trends",
      "school admissions Hyderabad",
      "Oakridge International School",
      "Delhi Public School",
      "Glendale Academy",
      "Chirec International School",
      "Meridian School",
      "Sancta Maria International School",
      "Silver Oaks International School",
      "NASR School",
      "Indus International School",
      "Johnson Grammar School",
      "Manthan International School"
    ]
  }
].map(client => ({
  ...client,
  keywords: [publicationCoverageKeyword, ...client.keywords]
}));

export default clients;
