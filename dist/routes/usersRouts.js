import { Router } from 'express';
import { getUsers, createUser, showUser, updateUser, deleteUser } from '../controllers/usercontroller.js';
const router = Router();
router.get('/', getUsers);
router.post('/', createUser);
router.get('/:id', showUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
export default router;
//# sourceMappingURL=usersRouts.js.map