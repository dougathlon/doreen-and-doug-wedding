export const wedding = {
  names: "Doreen & Doug",
  date: "Saturday 17 July 2027",
  friday: "Friday 16 July 2027",
  ceremonyTime: "1pm",
  church: "St Michael & All Angels",
  churchAddress: "Church Street, Appleby Magna",
  school: "Sir John Moore School",
  schoolAddress: "101 Top Street, Appleby Magna, DE12 7AH",
};

export const mapLink = (place) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;

export const hotels = [
  {
    name: "The Appleby Inn",
    place: "Appleby Parva · DE12 7AP",
    detail: "An inn with guest rooms, close to the village. Enquire directly about rooms for the Friday and Saturday nights.",
    url: "https://www.applebyinn.co.uk/",
  },
  {
    name: "Appleby Park Hotel",
    place: "A444, Appleby Magna · DE12 7AP",
    detail: "A hotel by Junction 11 of the M42, with standard and family rooms. Please book directly with the hotel.",
    url: "https://www.applebyparkhotel.com/",
  },
];

export const airports = [
  {
    name: "East Midlands",
    code: "EMA",
    note: "A convenient choice for the village",
    text: "A pre-booked taxi or hire car offers the simplest onward journey to Appleby Magna. There is no railway station at the airport itself; for this last part of the journey, we suggest travelling by road.",
    links: [{ label: "Airport taxis & transfers", url: "https://www.eastmidlandsairport.com/getting-to-and-from/by-taxi/" }],
  },
  {
    name: "Birmingham",
    code: "BHX",
    note: "By road, or by rail through Birmingham",
    text: "Pre-book a taxi to Appleby Magna, or take the free Air-Rail Link to Birmingham International station. Travel to Birmingham New Street, then take a train to Tamworth. Arrange a taxi from Tamworth to the village.",
    links: [{ label: "Airport rail connections", url: "https://www.birminghamairport.co.uk/transport-links/by-train/" }, { label: "Birmingham to Tamworth", url: "https://www.crosscountrytrains.co.uk/routes-destinations/routes/birmingham-to-tamworth" }],
  },
  {
    name: "Manchester",
    code: "MAN",
    note: "Rail connections to the Midlands",
    text: "The airport has its own railway station. Search for a through journey from Manchester Airport to Tamworth; the changes will depend on your train. Manchester Piccadilly is one possible connection. Pre-book a taxi for the final journey into Appleby Magna.",
    links: [{ label: "Airport rail connections", url: "https://www.manchesterairport.co.uk/getting-to-and-from/by-train/" }, { label: "Plan the complete rail journey", url: "https://www.nationalrail.co.uk/" }],
  },
  {
    name: "London Heathrow",
    code: "LHR",
    note: "Through London Euston, then Tamworth",
    text: "Take the Piccadilly line to Green Park, then the Victoria line northbound to Euston. From London Euston, take a train to Tamworth and a pre-booked taxi to Appleby Magna. Allow ample time for the airport and London connections, particularly after a long flight.",
    links: [{ label: "Heathrow rail & Underground", url: "https://www.heathrow.com/transport-and-directions/by-rail-or-train" }, { label: "Plan the London connection", url: "https://tfl.gov.uk/plan-a-journey/" }],
  },
  {
    name: "London Gatwick",
    code: "LGW",
    note: "Through St Pancras and London Euston",
    text: "Take a Thameslink train to London St Pancras International, then make the short transfer to Euston on foot or by taxi. Continue by train to Tamworth and by pre-booked taxi to Appleby Magna. Check the walking route or arrange assistance if travelling with heavy luggage or limited mobility.",
    links: [{ label: "Gatwick rail connections", url: "https://www.gatwickairport.com/transport-options/train.html" }, { label: "Plan the onward railway journey", url: "https://www.nationalrail.co.uk/" }],
  },
  {
    name: "Stansted & Luton",
    code: "STN / LTN",
    note: "Further London options",
    text: "From Stansted, take the Stansted Express to Tottenham Hale, then the Victoria line to Euston. From Luton, take the DART to Luton Airport Parkway, then a train to St Pancras and transfer to Euston. From Euston, continue to Tamworth and arrange a taxi to Appleby Magna. Check the complete route before choosing a flight; alternatives may suit your arrival better.",
    links: [{ label: "Stansted rail connections", url: "https://www.stanstedairport.co.uk/getting-to-and-from/by-train/" }, { label: "Luton DART", url: "https://www.lutondart.com/help/faqs/" }],
  },
];
