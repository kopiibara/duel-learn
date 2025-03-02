import useFirebaseError from "./useFirebaseError";
import useNetworkError from "./useNetworkError";
import useSQLError from "./useSQLError";
import { auth, db } from "../../services/firebase";
import { deleteUser } from "firebase/auth";
import { deleteDoc, doc } from "firebase/firestore";
const useCombinedErrorHandler = () => {
  const { error: firebaseError, handleFirebaseError } = useFirebaseError();
  const { error: networkError, handleNetworkError } = useNetworkError();
  const { error: sqlError, handleSQLError } = useSQLError();

  const handleError = (error: any) => {
    if (error.code && error.code.startsWith("auth/")) {
      handleFirebaseError(error);
      if (auth.currentUser) {
        deleteUser(auth.currentUser);
        deleteDoc(doc(db, "users", auth.currentUser.uid));
      }
    } else if (error.code && error.code.startsWith("ERR_")) {
      handleNetworkError(error);
      if (auth.currentUser) {
        deleteUser(auth.currentUser);
        deleteDoc(doc(db, "users", auth.currentUser.uid));
      }
    } else if (error.code && error.code.startsWith("ER_")) {
      handleSQLError(error);
      if (auth.currentUser) {
        deleteUser(auth.currentUser);
        deleteDoc(doc(db, "users", auth.currentUser.uid));
      }
    } else {
      console.error("Unknown error:", error);if (auth.currentUser) {
        deleteUser(auth.currentUser);
        deleteDoc(doc(db, "users", auth.currentUser.uid));
      }
    }
  };

  return { firebaseError, networkError, sqlError, handleError };
};

export default useCombinedErrorHandler;
