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
const VAULT_ABI = require("../assets/vault-abi.json");

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
  const [claim, setClaim] = useState<any>("");
  const [amount, setAmount] = useState<any>("");
  const [loading, setLoading] = useState<any>(false);

  async function Claim() {
    setLoading(true);
    var vaultContract = new web3.eth.Contract(VAULT_ABI, vault?.vaultAddress);
    const weiValue = web3.utils.toWei(amount, "ether");

    try {
      var tx = await vaultContract.methods.makeClaim(weiValue).send({
        from: account,
        gasLimit: 3000000,
      });
      // console.log(tx);

      if (tx.transactionHash) {
        alert("You claim has been recorded!");
        console.log("Proposal ID", tx.events.ClaimCreated.returnValues[0]);
        setClaim(tx.events.ClaimCreated.returnValues[0]);
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
                Continue
              </Text>
            </Button>
          </VStack>
          <StackDivider h={"50px"} />
        </ModalBody>

        <ModalFooter
          justifyContent="center"
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
              Etherscan: <ExternalLinkIcon m={2} w={5} h={5} color="blue.400" />
            </Link>
          )}
          {claim && (
            <Link
              fontSize="sm"
              display="flex"
              alignItems="center"
              href={`https://www.tally.xyz/governance/eip155:4:0xcfd4aB1176Dd2F3bB76c0922646f3625c4B39D81/proposal/${claim}`}
              isExternal
              color="gray.400"
              ml={6}
              _hover={{
                color: "whiteAlpha.800",
                textDecoration: "underline",
              }}
            >
              Tally: <ExternalLinkIcon m={2} w={5} h={5} color="blue.400" />
            </Link>
          )}
          {/* https://www.tally.xyz/governance/eip155:4:0xcfd4aB1176Dd2F3bB76c0922646f3625c4B39D81/proposal/ */}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ClaimModal;
