const { expect } = require("chai")
const { assert } = require("console")
const exp = require("constants")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { describe, it } = require("mocha")
const { developmentChains, INITIAL_SUPPLY } = require("../../helper.hardhat.config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("OurToken Unit tests", () => {
          const multiplier = 10 ** 18
          let ourToken, user1, deployer
          beforeEach(async function () {
              const accounts = getNamedAccounts()
              deployer = accounts.deployer
              user1 = accounts.user1

              await deployments.fixture("all")
              ourToken = await ethers.getContract("OurToken", deployers)
          })
          it("was deployed", async () => {
              assert(ourToken.address)
          })
          describe("constructor", async () => {
              it("Should have correct INITIAL_SUPPLY of token", async () => {
                  const totalSupply = ourToken.totalSupply()
                  assert.equal(totalSupply.toString(), INITIAL_SUPPLY)
              })
              it("initializes the token with the righ name and symbol", async () => {
                  const name = ourToken.name().toString()
                  assert.equal(name, "OurToken")

                  const symbol = ourToken.symbol().toString()
                  assert.equal(symbol, "OT")
              })
          })
          describe("transfers", async () => {
              it("Should be able to successfully transfer tokens to an address", async () => {
                  const tokensToSend = ethers.utils.parseEther("10")
                  await ourToken.transfer(user1, tokensToSend)

                  expect(await ourToken.balanceOf(user1).to.equal(tokensToSend))
              })
              it("emits an transfer event, when a transfer occurs", async () => {
                  await expect(ourToken.transfer(user1, (10 * multiplier).toString())).to.emit(
                      ourToken,
                      "Transfer"
                  )
              })
          })
          describe("allowances", async () => {
              const amount = (20 * multiplier).toString()
              beforeEach(async () => {
                  const playerToken = await ethers.getContract("OurToken", user1)
              })
              it("Should approve other address to spend tokens", async () => {
                  const tokensToSpend = ethers.utils.parseEther("5")
                  await ourToken.approve(user1, tokensToSpend)
                  await playerToken.transferFrom(deployer, user1, tokensToSpend)
                  await expect(playerToken.balanceOf(user1).to.equal(tokensToSpend))
              })
              it("doesn't allow unapproved member to do tranfers", async () => {
                  expect(
                      await playerToken.transferFrom(deployer, user1, amount)
                  ).to.be.revertedWith("ERC20: insufficient allowance")
              })
              it("emits an approval event, whe an approval occurs", async () => {
                  await expect(ourToken.approve(user1, amount)).to.be.emit(ourToken, "Approval")
              })
              it("allowance being set is correct", async () => {
                  ourToken.approve(user1, amount)
                  const allowance = await ourToken.allowance(deployer, user1)
                  assert.equal(allowance.toString(), amount)
              })
              it("won't allow a user to go over the allowance", async () => {
                  ourToken.approve(user1, amount)
                  await expect(
                      ourToken.transferFrom(deployer, user1, (40 * multiplier).toString())
                  ).to.be.revertedWith("ERC20: insufficient allowance")
              })
          })
      })
