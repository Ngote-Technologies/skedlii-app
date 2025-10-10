// import { HashLink } from "react-router-hash-link";

// export default function Footer() {
//   return (
//     <footer className="bg-gray-900 text-gray-400 py-12">
//       <div className="container mx-auto px-4">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
//           <div>
//             <div className="text-white text-2xl font-bold flex items-center mb-4">
//               <i className="ri-calendar-check-fill mr-1"></i>
//               <span className="font-heading">Skedlii</span>
//             </div>
//             <p className="mb-4">
//               Simplify social media management for your entire team.
//             </p>
//             <div className="flex space-x-4">
//               <button className="text-gray-400 hover:text-white">
//                 <i className="ri-twitter-fill text-lg"></i>
//               </button>
//               <button className="text-gray-400 hover:text-white">
//                 <i className="ri-linkedin-fill text-lg"></i>
//               </button>
//               <button className="text-gray-400 hover:text-white">
//                 <i className="ri-instagram-fill text-lg"></i>
//               </button>
//             </div>
//           </div>

//           <div>
//             <h3 className="text-white font-medium text-lg mb-4">Product</h3>
//             <ul className="space-y-2">
//               <li>
//                 <HashLink smooth to="/" elementId="features">
//                   <span className="hover:text-white">Features</span>
//                 </HashLink>
//               </li>
//               <li>
//                 <HashLink smooth to="/" elementId="solutions">
//                   <span className="hover:text-white">Solutions</span>
//                 </HashLink>
//               </li>
//               <li>
//                 <HashLink smooth to="/" elementId="pricing">
//                   <span className="hover:text-white">Pricing</span>
//                 </HashLink>
//               </li>
//               <li>
//                 <HashLink smooth to="/" elementId="roadmap">
//                   <span className="hover:text-white">Roadmap</span>
//                 </HashLink>
//               </li>
//             </ul>
//           </div>

//           <div>
//             <h3 className="text-white font-medium text-lg mb-4">Company</h3>
//             <ul className="space-y-2">
//               <li>
//                 <HashLink smooth to="/" elementId="about">
//                   <span className="hover:text-white">About Us</span>
//                 </HashLink>
//               </li>
//               <li>
//                 <HashLink smooth to="/" elementId="careers">
//                   <span className="hover:text-white">Careers</span>
//                 </HashLink>
//               </li>
//               <li>
//                 <HashLink smooth to="/" elementId="blog">
//                   <span className="hover:text-white">Blog</span>
//                 </HashLink>
//               </li>
//               <li>
//                 <HashLink smooth to="/" elementId="contact">
//                   <span className="hover:text-white">Contact</span>
//                 </HashLink>
//               </li>
//             </ul>
//           </div>

//           <div>
//             <h3 className="text-white font-medium text-lg mb-4">Resources</h3>
//             <ul className="space-y-2">
//               <li>
//                 <HashLink smooth to="/" elementId="help-center">
//                   <span className="hover:text-white">Help Center</span>
//                 </HashLink>
//               </li>
//               <li>
//                 <HashLink smooth to="/" elementId="status">
//                   <span className="hover:text-white">Status</span>
//                 </HashLink>
//               </li>
//               <li>
//                 <HashLink smooth to="/privacy" elementId="privacy">
//                   <span className="hover:text-white">Privacy Policy</span>
//                 </HashLink>
//               </li>
//               <li>
//                 <HashLink smooth to="/terms" elementId="terms">
//                   <span className="hover:text-white">Terms of Service</span>
//                 </HashLink>
//               </li>
//             </ul>
//           </div>
//         </div>

//         <div className="mt-12 pt-8 border-t border-gray-800 text-center">
//           <p>&copy; {new Date().getFullYear()} Skedlii. All rights reserved.</p>
//         </div>
//       </div>
//     </footer>
//   );
// }

import { HashLink } from "react-router-hash-link";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="text-white text-2xl font-bold flex items-center mb-4">
              <i className="ri-calendar-check-fill mr-1"></i>
              <span className="font-heading">Skedlii</span>
            </div>
            <p className="mb-4">
              Simplify social media management for your entire team.
            </p>
            <div className="flex space-x-4">
              <button className="text-gray-400 hover:text-white">
                <i className="ri-twitter-fill text-lg"></i>
              </button>
              <button className="text-gray-400 hover:text-white">
                <i className="ri-linkedin-fill text-lg"></i>
              </button>
              <button className="text-gray-400 hover:text-white">
                <i className="ri-instagram-fill text-lg"></i>
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-white font-medium text-lg mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <HashLink smooth to="/" elementId="features">
                  <span className="hover:text-white">Features</span>
                </HashLink>
              </li>
              <li>
                <HashLink smooth to="/" elementId="solutions">
                  <span className="hover:text-white">Solutions</span>
                </HashLink>
              </li>
              <li>
                <Link to="/pricing">
                  <span className="hover:text-white">Pricing</span>
                </Link>
              </li>
              <li>
                <Link to="/roadmap">
                  <span className="hover:text-white">Roadmap</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-medium text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about">
                  <span className="hover:text-white">About</span>
                </Link>
              </li>
              <li>
                <Link to="/careers">
                  <span className="hover:text-white">Careers</span>
                </Link>
              </li>
              <li>
                <Link to="/blog">
                  <span className="hover:text-white">Blog</span>
                </Link>
              </li>
              <li>
                <Link to="/contact">
                  <span className="hover:text-white">Contact</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-medium text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help">
                  <span className="hover:text-white">Help Center</span>
                </Link>
              </li>
              <li>
                <Link to="/status">
                  <span className="hover:text-white">Status</span>
                </Link>
              </li>
              <li>
                <Link to="/privacy">
                  <span className="hover:text-white">Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link to="/terms">
                  <span className="hover:text-white">Terms of Service</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p>&copy; {new Date().getFullYear()} Skedlii. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
