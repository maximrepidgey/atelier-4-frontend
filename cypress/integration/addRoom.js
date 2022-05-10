/// <reference types="cypress" />

describe('Testing the house page', function () {
    
    beforeEach(() => {
        cy.Login()
        cy.visit('/addRoom')
      })

    it('testing all the buttons', function () {
        cy.contains('Add room')
        cy.contains('Icon')
        cy.contains('Customize background')

        cy.get(".btn-secondary")
            .eq(1)
            .click()
        cy.url()
            .should('include', '/house')
        cy.visit('/addRoom')


    })

    it('test adding a room', function () {
        const roomName = "room3";
        cy.route("POST", "**/rooms",).as("postRoom");


        cy.get("input[type=text]")
            .type(roomName)
            .get(".material-icons")
            .click()
        cy.contains("Select Icon")
        cy.get(".selectionIconBtn").eq(12)
            .click()

        cy.get(".btn-primary")
            .click()

        cy.wait("@postRoom")
        .its("requestBody")
        .should("deep.equal", {
            name: roomName,
            icon: "./img/icons/rooms/icon-office.svg",
            background: "./img/backgrounds/rooms/background-office.svg",
            devices: []
        });
       
       

    })

})

