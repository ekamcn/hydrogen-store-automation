// import { useEffect, useState } from 'react';

// const StoreList = () => {
//   const [stores, setStores] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetch('http://192.168.1.29:300/store/all') // 👈 Your actual endpoint
//       .then(response => {
//         if (!response.ok) {
//           throw new Error('Failed to fetch store data');
//         }
//         return response.json();
//       })
//       .then(data => {
//         setStores(data.data || []); // adjust if response shape is different
//         setLoading(false);
//       })
//       .catch(err => {
//         setError(err.message);
//         setLoading(false);
//       });
//   }, []);

//   if (loading) return <p>Loading stores...</p>;
//   if (error) return <p>Error: {error}</p>;

//   return (
//     <div>
//       <h2>Store List</h2>
//       <ul>
//         {stores.map((store, index) => (
//           <li key={index}>{store.name}</li> // adjust field name as per API
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default StoreList;
