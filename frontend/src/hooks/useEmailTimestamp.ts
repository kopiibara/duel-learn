import { useState, useEffect } from "react";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

const useEmailTimestamp = (email: string) => {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  const checkTimestamp = async () => {
    try {
      const db = getFirestore();
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        let emailTimestamp = userData.emailTimestamp?.toDate();
        if (!emailTimestamp) {
          emailTimestamp = new Date(localStorage.getItem("emailTimestamp") || "");
        }

        if (emailTimestamp) {
          const now = new Date();
          const elapsed = now.getTime() - emailTimestamp.getTime();
          const remaining = 5 * 60 * 1000 - elapsed;

          if (remaining > 1) {
            setTimeRemaining(remaining);
            setIsButtonDisabled(true);
            return false;
          }
        }
      }
      setIsButtonDisabled(false);
      return true;
    } catch (err) {
      console.error("Error checking email timestamp:", err);
      setIsButtonDisabled(false);
      return false;
    }
  };

  useEffect(() => {
    checkTimestamp();
  }, [email]);

  useEffect(() => {
    if (timeRemaining !== null) {
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev && prev > 1000) {
            return prev - 1000;
          } else {
            clearInterval(interval);
            setIsButtonDisabled(false);
            return null;
          }
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timeRemaining]);

  return { timeRemaining, isButtonDisabled, checkTimestamp };
};

export default useEmailTimestamp;
