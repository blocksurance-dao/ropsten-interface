import {
  Button,
  Link,
  VStack,
  StackDivider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
  Input,
  Image,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { useState } from "react";
import { useColorMode } from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";

import ethereum from "../assets/images/ethereum.png";
const GOVERNOR_ABI = require("../assets/governor-abi.json");
const GOVERNOR_ADDRESS = process.env.REACT_APP_GOVERNOR_ADDRESS;

type ClaimModalProps = {
  isOpen: any;
  onClose: any;
  web3: any;
  account: any;
  vault: any;
  symbol: any;
};

const ClaimModal = ({
  isOpen,
  onClose,
  web3,
  account,
  vault,
  symbol,
}: ClaimModalProps) => {
  const { colorMode } = useColorMode();

  const [tlink, setTLink] = useState<any>("");
  const [amount, setAmount] = useState<any>("");
  const [loading, setLoading] = useState<any>(false);

  async function Claim() {
    setLoading(true);

    var governorContract = new web3.eth.Contract(
      GOVERNOR_ABI,
      GOVERNOR_ADDRESS
    );

    const weiValue = web3.utils.toWei(amount, "ether");
    const signature = web3.eth.abi.encodeFunctionSignature(
      "_transfer(address,uint256)"
    );

    try {
      var tx = await governorContract.methods
        .propose(
          [account],
          [weiValue],
          [signature],
          `Claim lost value from vault ${vault?.vaultAddress} for token  ${symbol}  ${vault?.tokenAddress}`
        )
        .send({
          from: account,
          gasLimit: 3000000,
        });
      // console.log(tx);

      if (tx.transactionHash) {
        alert("You claim has been recorded!");
        console.log("Proposal ID", tx.events.ProposalCreated.returnValues[0]);
        console.log("Transaction:", tx.transactionHash);
        setTLink(tx.transactionHash);
      }
    } catch (error: any) {
      let message = error?.message;
      console.log(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent
        border="1px"
        borderStyle="solid"
        borderColor="gray.700"
        borderRadius="3xl"
      >
        <ModalHeader px={4} fontSize="lg" fontWeight="medium">
          File a claim
        </ModalHeader>
        <ModalCloseButton
          fontSize="sm"
          _hover={{
            color: "whiteAlpha.700",
          }}
        />
        <ModalBody pt={0} px={4}>
          <StackDivider h={"50px"} />
          <VStack
            w="100%"
            h="100%"
            minW="300px"
            spacing={"20px"}
            borderRadius="3xl"
            border="1px"
            borderStyle="solid"
            borderColor="gray.600"
            p={5}
          >
            <Text fontSize="md" fontWeight="medium">
              Enter the amount of ETH you are claiming
            </Text>
            <InputGroup
              border="1px"
              borderStyle="solid"
              borderColor="blue.300"
              borderRadius="xl"
            >
              <InputLeftElement
                pointerEvents="none"
                ml="2px"
                mt="-1px"
                children={
                  <Image
                    borderRadius="full"
                    boxSize="25px"
                    src={ethereum}
                    alt=""
                  />
                }
              />
              <StackDivider w={"50px"} borderRight="1px" color="blue.300" />
              <Input
                w={"100%"}
                border="0px"
                style={{ textAlign: "center" }}
                placeholder={"Amount in tokens"}
                value={amount}
                maxW={"3xl"}
                onChange={(e) => {
                  setAmount(e.target.value);
                }}
              />
            </InputGroup>
            <StackDivider h={"50px"} />

            <Button
              onClick={Claim}
              bg={colorMode === "dark" ? "gray.800" : "gray.400"}
              w="100%"
              _hover={{
                border: "1px",
                borderStyle: "solid",
                borderColor: "blue.400",
                backgroundColor: colorMode === "dark" ? "cyan.800" : "gray.400",
              }}
              borderRadius="xl"
              m="2px"
              height="40px"
              disabled={!amount || !(Number(amount) > 0)}
              isLoading={loading}
            >
              <Text fontSize="md" fontWeight="medium">
                Claim
              </Text>
            </Button>
          </VStack>
          <StackDivider h={"50px"} />
        </ModalBody>

        <ModalFooter
          justifyContent="center"
          //background="gray.700"
          borderBottomLeftRadius="3xl"
          borderBottomRightRadius="3xl"
          p={6}
          minW="200px"
        >
          {tlink && (
            <Link
              fontSize="sm"
              display="flex"
              alignItems="center"
              href={`https://rinkeby.etherscan.io/tx/${tlink}`}
              isExternal
              color="gray.400"
              ml={6}
              _hover={{
                color: "whiteAlpha.800",
                textDecoration: "underline",
              }}
            >
              Confirmed: <ExternalLinkIcon m={2} w={5} h={5} color="blue.400" />
            </Link>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ClaimModal;
