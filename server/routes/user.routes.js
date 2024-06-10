const express = require("express");
const { isAuthenticated } = require('../middleware/authenticated');
const UserController = require('../controllers/user');

const router = express.Router();

/**
 * @swagger
 *
 * /user:
 *   get:
 *     tags:
 *     - User
 *     summary: Get Current User
 *     description: Returns the currently authenticated user
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Current User Information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   description: The user's unique identifier.
 *                   example: "109876543212345678901"
 *                 id:
 *                   type: string
 *                   description: The user's Id in the third party user authentication provider.
 *                   example: "1234567890987654321"
 *                 provider:
 *                   type: string
 *                   description: The name of the third party user authentication provider.
 *                   example: "google"
 *                 name:
 *                   type: string
 *                   description: The user's full name.
 *                   example: "John Doe"
 *                 email:
 *                   type: string
 *                   description: The user's email.
 *                   example: "john.doe@acme.com" 
 *
 *       401:
 *         description: Unauthorized
 *
 */
router.get('/user',
    isAuthenticated,
    async (req, res) => {
        // extract provider and id from our current user
        const id = req.user?.id;
        const provider = req.user?.provider;
        const user = await UserController.getUserByProviderId(provider, id);
        res.send(user);
    }
);


// export the router
module.exports = router;