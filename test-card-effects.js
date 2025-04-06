/**
 * Card Effects Test Script
 * This script simulates a battle session with card effects
 * Run with: node test-card-effects.js
 */

const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:3000/api'; // Update with your API URL
const LOBBY_CODE = 'test-' + Math.floor(Math.random() * 10000);
const HOST_ID = 'host-' + Math.floor(Math.random() * 1000);
const GUEST_ID = 'guest-' + Math.floor(Math.random() * 1000);

// Main test function
async function testCardEffects() {
    console.log('Starting Card Effects Test');
    console.log('-------------------------');
    console.log(`Lobby: ${LOBBY_CODE}, Host: ${HOST_ID}, Guest: ${GUEST_ID}`);

    try {
        // Step 1: Initialize battle session
        console.log('\n1. Creating battle session...');
        const session = await initializeSession();
        console.log(`Session created with UUID: ${session.session_uuid}`);

        // Step 2: Initialize battle rounds
        console.log('\n2. Initializing battle rounds...');
        await initializeRounds(session.session_uuid);

        // Step 3: Initialize battle scores
        console.log('\n3. Initializing battle scores...');
        await initializeScores(session.session_uuid);

        // Step 4: Update battle session to start
        console.log('\n4. Starting battle...');
        await startBattle(LOBBY_CODE);

        // Set current turn to host
        await setCurrentTurn(LOBBY_CODE, HOST_ID);

        // Step 5: Test normal-1 card (Time Manipulation)
        console.log('\n5. Testing normal-1 card (Time Manipulation)...');
        await testTimeManipulationCard(session.session_uuid);

        // Step 6: Test normal-2 card (Quick Draw)
        console.log('\n6. Testing normal-2 card (Quick Draw)...');
        await testQuickDrawCard(session.session_uuid);

        // Step 7: Get active card effects
        console.log('\n7. Retrieving active card effects...');
        const hostEffects = await getCardEffects(session.session_uuid, 'host');
        const guestEffects = await getCardEffects(session.session_uuid, 'guest');

        console.log('Host card effects:', hostEffects);
        console.log('Guest card effects:', guestEffects);

        // Step 8: Test consuming a card effect
        console.log('\n8. Testing consuming a card effect...');
        if (guestEffects && guestEffects.effects && guestEffects.effects.length > 0) {
            const effect = guestEffects.effects[0];
            console.log(`Consuming effect: ${effect.type}`);
            await consumeCardEffect(session.session_uuid, 'guest', effect.type);

            // Verify the effect was consumed
            const updatedEffects = await getCardEffects(session.session_uuid, 'guest');
            console.log('Updated guest effects:', updatedEffects);
        } else {
            console.log('No guest effects to consume');
        }

        console.log('\nTest completed successfully!');

    } catch (error) {
        console.error('Test failed:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

// Helper functions
async function initializeSession() {
    const response = await axios.post(`${API_URL}/gameplay/battle/initialize-session`, {
        lobby_code: LOBBY_CODE,
        host_id: HOST_ID,
        guest_id: GUEST_ID,
        host_username: 'HostPlayer',
        guest_username: 'GuestPlayer',
        total_rounds: 10,
        is_active: true,
        host_in_battle: true,
        guest_in_battle: true,
        difficulty_mode: 'average',
        study_material_id: 'test-material',
        question_types: ['multiple-choice', 'true-false']
    });

    return response.data.data;
}

async function initializeRounds(sessionUuid) {
    const response = await axios.post(`${API_URL}/gameplay/battle/initialize-rounds`, {
        session_uuid: sessionUuid,
        round_number: 1
    });

    return response.data.data;
}

async function initializeScores(sessionUuid) {
    const response = await axios.post(`${API_URL}/gameplay/battle/initialize-scores`, {
        session_uuid: sessionUuid,
        host_health: 100,
        guest_health: 100
    });

    return response.data.data;
}

async function startBattle(lobbyCode) {
    const response = await axios.put(`${API_URL}/gameplay/battle/update-session`, {
        lobby_code: lobbyCode,
        battle_started: true,
        host_in_battle: true,
        guest_in_battle: true
    });

    return response.data.data;
}

async function setCurrentTurn(lobbyCode, playerId) {
    const response = await axios.put(`${API_URL}/gameplay/battle/update-session`, {
        lobby_code: lobbyCode,
        current_turn: playerId
    });

    return response.data.data;
}

async function testTimeManipulationCard(sessionUuid) {
    // Host uses Time Manipulation card and answers correctly
    const response = await axios.put(`${API_URL}/gameplay/battle/update-round`, {
        session_uuid: sessionUuid,
        player_type: 'host',
        card_id: 'normal-1',
        is_correct: true,
        lobby_code: LOBBY_CODE
    });

    console.log('Time Manipulation response:', response.data.message);
    console.log('Card effect:', response.data.data.card_effect);

    return response.data;
}

async function testQuickDrawCard(sessionUuid) {
    // First set turn to guest
    await setCurrentTurn(LOBBY_CODE, GUEST_ID);

    // Guest uses Quick Draw card and answers correctly
    const response = await axios.put(`${API_URL}/gameplay/battle/update-round`, {
        session_uuid: sessionUuid,
        player_type: 'guest',
        card_id: 'normal-2',
        is_correct: true,
        lobby_code: LOBBY_CODE
    });

    console.log('Quick Draw response:', response.data.message);
    console.log('Card effect:', response.data.data.card_effect);

    // Check whose turn it is now (should still be guest)
    const sessionResponse = await axios.get(`${API_URL}/gameplay/battle/session-state/${LOBBY_CODE}`);
    console.log(`Current turn after Quick Draw: ${sessionResponse.data.data.current_turn}`);
    console.log(`Should still be guest (${GUEST_ID})`);

    return response.data;
}

async function getCardEffects(sessionUuid, playerType) {
    const response = await axios.get(`${API_URL}/gameplay/battle/card-effects/${sessionUuid}/${playerType}`);
    return response.data.data;
}

async function consumeCardEffect(sessionUuid, playerType, effectType) {
    const response = await axios.post(`${API_URL}/gameplay/battle/consume-card-effect`, {
        session_uuid: sessionUuid,
        player_type: playerType,
        effect_type: effectType
    });

    return response.data;
}

// Run the test
testCardEffects(); 