import { Navigate, Routes, Route } from "react-router-dom";
import { KitContext } from "./core/kit";
import { About, Contact, Dealer, Dealers, Login, PostReview, Register } from "./core/pages";
import Theme from "./theme";

function App() {
  return (
    <Theme>
      {(kit) => (
        <KitContext.Provider value={kit}>
          <Routes>
            <Route path="/" element={<kit.Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dealers" element={<Dealers />} />
            <Route path="/dealer/:id" element={<Dealer />} />
            <Route path="/postreview/:id" element={<PostReview />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </KitContext.Provider>
      )}
    </Theme>
  );
}

export default App;
