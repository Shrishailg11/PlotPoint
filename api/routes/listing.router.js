import express from 'express';
import { createListing, deleteListing, updateListing, getListing, getListings } from '../controllers/listing.controller.js';
import { verifyToken } from '../utils/verifyToken.js';

const router = express.Router();

router.post('/create',verifyToken, createListing);
router.delete('/delete/:id', verifyToken, deleteListing); // New route for deleting a listing
router.post('/update/:id', verifyToken, updateListing); // New route for updating a listing
router.get('/get/:id', getListing); // Existing route for getting a single listing
router.get('/user-listings/:id', verifyToken, getListings); // New route for getting all listings by a user


export default router;