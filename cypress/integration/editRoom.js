/// <reference types="cypress" />

describe('Testing the edit room page', function () {
    
    beforeEach(() => {
        cy.Login()
        cy.route("GET", "**/rooms", "fixture:rooms.json").as("getRooms");
        cy.visit('/editRoom?id=1')

      })

    it('testing all the buttons', function () {
        cy.contains('Edit room')
        cy.contains('Icon')
        cy.contains('Customize background')

        cy.get(".btn-secondary")
            .eq(1)
            .click()
        cy.url()
            .should('include', '/house')
        cy.visit('/addRoom')

        


    })
    it('test deleting a room', function () {
        cy.server()
        cy.route("DELETE", "**/rooms/1",).as("deleteRoom");

        cy.get(".btn-secondary").eq(2)
        .click()
       

        cy.wait("@deleteRoom")
        .its("request")
        .should("deep.equal", {
            headers: {
                user: "user1",
                "session-token": "sdjvayusd6asdyasgdi7a"
                },
            body: null
        })
    })




    it('test editing a room', function () {
        const editRoomName = "roomEdited";
        cy.server()
        cy.route("PUT", "**/rooms/1",).as("editRoom");


        cy.get("input[type=text]")
            .type(editRoomName)
            .get(".material-icons")
            .click()
        cy.contains("Select Icon")
        cy.get(".selectionIconBtn").eq(5)
            .click()
        cy.get(".btn-primary")
            .click()
        

        cy.wait("@editRoom")
        .its("requestBody")
        .should("deep.equal", {
            name: editRoomName,
            icon: "./img/icons/rooms/icon-dining-room.svg",
            background: "./img/backgrounds/rooms/background-dining-room.svg"
        });
       

    })

  
 })