import { useState, useEffect, useRef } from "react";
import { formatUnits } from "@ethersproject/units";
import {
  Box,
  VStack,
  HStack,
  StackDivider,
  Input,
  Button,
  Text,
  Link,
} from "@chakra-ui/react";
import { useColorMode, useDisclosure } from "@chakra-ui/react";
import {
  CloseIcon,
  CopyIcon,
  LockIcon,
  WarningTwoIcon,
  ExternalLinkIcon,
} from "@chakra-ui/icons";

import Identicon from "./Identicon";
import ClaimModal from "./ClaimModal";

const TOKENLIST = require("../assets/TokenList.json");
const VAULT_ABI = require("../assets/vault-abi.json");
const ERC20_ABI = require("../assets/erc20-abi.json");
const STAKER_ABI = require("../assets/staker-abi.json");
const STAKER_ADDRESS = process.env.REACT_APP_STAKER_ADDRESS;

export default function VaultInterface(props: any) {
  const web3 = props.web3;
  const active = props.item;
  const account = props.account;
  const vaultAddress = props.item.vaultAddress;
  const { colorMode } = useColorMode();
  const [loading, setLoading] = useState<any>(false);

  const [token, setToken] = useState<any>("");
  const [stake, setStake] = useState<number>(0);
  const [claim, setClaim] = useState<number>(0);
  const [symbol, setSymbol] = useState<any>("");
  const [approve, setApprove] = useState<any>(false);
  const [copied, setCopied] = useState<any>(false);
  const [balance, setBalance] = useState<any>();
  const [userBal, setUserbal] = useState<any>();
  const [allowance, setAllowance] = useState<any>();
  const [tokenObject, setTokenObject] = useState<any>({});
  const { isOpen, onOpen, onClose } = useDisclosure();

  async function onCloseCustom() {
    onClose();

    var vaultContract = new web3.eth.Contract(VAULT_ABI, vaultAddress);
    vaultContract.methods
      .claim()
      .call()
      .then((res: any) => {
        setClaim(res);
      })
      .catch((e: any) => {
        console.log(e);
      });
  }

  var isMounted = useRef(false);

  useEffect(() => {
    var coinContract = new web3.eth.Contract(
      ERC20_ABI,
      props.item?.tokenAddress
    );
    var stakerContract = new web3.eth.Contract(STAKER_ABI, STAKER_ADDRESS);
    var vaultContract = new web3.eth.Contract(VAULT_ABI, vaultAddress);
    isMounted.current = true;

    let tokenObject: { decimals: number };
    for (let item of TOKENLIST?.tokens) {
      if (item.address === active?.tokenAddress) {
        if (isMounted.current) {
          tokenObject = item;
          setTokenObject(item);
        }
        break;
      }
    }

    vaultContract.methods
      .claim()
      .call()
      .then((res: any) => {
        if (isMounted.current) {
          setClaim(res);
          console.log(res);
        }
      })
      .catch((e: any) => {
        console.log(e);
      });

    coinContract.methods
      .allowance(account, vaultAddress)
      .call()
      .then((res: any) => {
        if (isMounted.current) {
          setAllowance(
            parseFloat(formatUnits(res, tokenObject.decimals)).toFixed(3)
          );
        }
      })
      .catch((e: any) => {
        console.log(e);
      });

    coinContract.methods
      .balanceOf(vaultAddress)
      .call()
      .then((res: any) => {
        if (isMounted.current) {
          setBalance(
            parseFloat(formatUnits(res, tokenObject.decimals)).toFixed(2)
          );
          // console.log(balance);
        }
      })
      .catch((e: any) => {
        console.log(e);
      });

    coinContract.methods
      .balanceOf(account)
      .call()
      .then((res: any) => {
        if (isMounted.current) {
          setUserbal(
            parseFloat(formatUnits(res, tokenObject.decimals)).toFixed(2)
          );
          // console.log(balance);
        }
      })
      .catch((e: any) => {
        console.log(e);
      });

    coinContract.methods
      .symbol()
      .call()
      .then((res: any) => {
        if (isMounted.current) {
          setSymbol(res);
        }
      })
      .catch((e: any) => {
        console.log(e);
      });

    stakerContract.methods
      .getUserStake(account)
      .call()
      .then((res: any) => {
        if (isMounted.current) {
          // console.log(res);
          setStake(res.amount);
        }
      })
      .catch((e: any) => {
        console.log(e);
      });
    return () => {
      // executed when unmount
      isMounted.current = false;
    };
  }, [loading, account, web3, vaultAddress, active]);

  function strtodec(amount: string, dec: number) {
    let stringf = "";
    for (var i = 0; i < dec; i++) {
      stringf = stringf + "0";
    }
    return amount + stringf;
  }

  async function approveDeposit() {
    setLoading(true);
    var coinContract = new web3.eth.Contract(ERC20_ABI, active?.tokenAddress);

    try {
      var approved = await coinContract.methods
        .approve(active?.vaultAddress, strtodec(token, tokenObject?.decimals))
        .send({
          from: account,
          gasLimit: 3000000,
        });
      // console.log(approved);
      if (approved?.transactionHash) {
        setApprove(true);
      }
    } catch (error: any) {
      //console.log(error);
      let message = error?.message;
      console.log(message);
    } finally {
      setLoading(false);
    }
  }

  async function Deposit() {
    if (!token || !(token > 0)) {
      alert("Please enter an amount of tokens.");
      return;
    }
    if (token > allowance) {
      alert(
        "Your deposit amount must be equal to or less than your allowance. Please increase your allowance."
      );
      return;
    }
    setLoading(true);
    var vaultContract = new web3.eth.Contract(VAULT_ABI, active?.vaultAddress);

    try {
      await vaultContract.methods
        .storeTokens(strtodec(token, tokenObject?.decimals))
        .send({
          from: account,
          gasLimit: 3000000,
        });
    } catch (error: any) {
      //console.log(error);
      let message = error?.message;
      console.log(message);
    } finally {
      setLoading(false);
      setToken("");
    }
  }

  async function Withdraw() {
    setLoading(true);
    var vaultContract = new web3.eth.Contract(VAULT_ABI, active?.vaultAddress);
    var coinContract = new web3.eth.Contract(ERC20_ABI, active?.tokenAddress);
    try {
      var stored = await vaultContract.methods.withdrawTokens().send({
        from: account,
        gasLimit: 3000000,
      });
      // console.log(stored);

      if (stored.transactionHash) {
        var balance = await coinContract.methods
          .balanceOf(active?.vaultAddress)
          .call();
        console.log(balance);
        setBalance(balance);
      }
    } catch (error: any) {
      //console.log(error);
      let message = error?.message;
      console.log(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <VStack w="100%" h="100%" spacing={"20px"} mt={"3px"}>
      <Box
        bg={colorMode === "dark" ? "gray.700" : "gray.100"}
        w="100%"
        border="3px"
        borderStyle="solid"
        borderRadius="5px"
        borderColor={colorMode === "dark" ? "gray.700" : "gray.100"}
        padding={"10px"}
      >
        <HStack justifyContent="space-between" pb={4}>
          <Text fontSize="lg" ml={2}>
            {active.vaultName} ({symbol})
          </Text>

          <CloseIcon ml={5} onClick={() => props.Close()} alignSelf={"right"} />
        </HStack>
        <HStack justifyContent="space-between">
          <Box
            display="flex"
            alignItems="center"
            borderRadius="md"
            h={"42px"}
            bg={colorMode === "dark" ? "gray.600" : "gray.300"}
          >
            <Box px="3">
              <Text fontSize="md" color="blue.400">
                {balance}
              </Text>
            </Box>
            <Button
              onClick={() => {
                setCopied(!copied);
                navigator.clipboard.writeText(account);
              }}
              bg={colorMode === "dark" ? "gray.800" : "white"}
              _hover={{
                border: "1px",
                borderStyle: "solid",
                borderColor: "blue.400",
                backgroundColor: colorMode === "dark" ? "gray.700" : "gray.400",
              }}
              borderRadius="md"
              m="2px"
              px={3}
              height="38px"
            >
              <Text fontSize="md" fontWeight="medium" mr="2">
                {active.vaultAddress &&
                  `${active.vaultAddress.slice(
                    0,
                    6
                  )}...${active.vaultAddress.slice(
                    active.vaultAddress.length - 4,
                    active.vaultAddress.length
                  )}`}
              </Text>
              {active.vaultAddress && (
                <CopyIcon m={2} color={copied ? "blue.400" : "gray.400"} />
              )}
              {active.vaultAddress && (
                <Identicon account={active.vaultAddress} />
              )}
            </Button>
          </Box>
        </HStack>
        <Text fontSize="lg" mt={4} ml={2}>
          Available: {userBal}
        </Text>
      </Box>
      {Number(claim) !== 0 ? (
        <HStack
          bg={colorMode === "dark" ? "gray.700" : "gray.100"}
          w="100%"
          p={4}
          mt={"3px"}
          border="3px"
          borderStyle="solid"
          borderRadius="5px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.100"}
        >
          <Text fontSize="lg">You have a pending claim.</Text>

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
            <ExternalLinkIcon m={2} w={5} h={5} color="blue.400" />
          </Link>
        </HStack>
      ) : balance < 1 ? (
        <>
          <Text fontSize="sm" ml={4} maxW={"340px"}>
            You must approve transfer of tokens to your vault, current
            allowance: {allowance}
          </Text>
          <Input
            w={"80%"}
            border="1px"
            borderStyle="solid"
            borderColor="blue.300"
            style={{ textAlign: "center" }}
            placeholder={"Amount of tokens"}
            value={token}
            maxW={"3xl"}
            onChange={(e) => {
              setToken(e.target.value);
            }}
          />
          <StackDivider h={"36px"} />
          <Button
            h={"40px"}
            minW={"100%"}
            border="1px"
            borderStyle="solid"
            borderColor="gray.400"
            isLoading={loading}
            loadingText="Loading..."
            //disabled={approve}
            onClick={approveDeposit}
          >
            {approve ? "Approved " + allowance : "Approve transfer"}
          </Button>
          <Button
            h={"40px"}
            minW={"100%"}
            border="1px"
            borderStyle="solid"
            borderColor="gray.400"
            isLoading={loading}
            loadingText="Loading..."
            disabled={!parseInt(allowance) || parseInt(balance) > 0}
            onClick={Deposit}
          >
            Deposit
          </Button>
        </>
      ) : (
        <>
          <StackDivider h={"35px"} />
          <HStack justifyContent="space-between" pb={4}>
            <Text fontSize="lg" ml={4} color="green.300">
              {stake > 0 ? "Insured" : "Stake 4SHURE to get coverage!"}
            </Text>
            {stake > 0 ? (
              <LockIcon ml={5} color="green.300" />
            ) : (
              <WarningTwoIcon ml={5} color="yellow.300" />
            )}
          </HStack>
          <StackDivider h={"30px"} />
          {balance > 0 && stake > 0 && (
            <Button
              h={"40px"}
              minW={"100%"}
              mb={5}
              border="1px"
              borderStyle="solid"
              borderColor="gray.400"
              isLoading={loading}
              loadingText="Loading..."
              disabled={!parseInt(balance)}
              onClick={onOpen}
            >
              Make Claim
            </Button>
          )}

          <ClaimModal
            isOpen={isOpen}
            onClose={onCloseCustom}
            web3={web3}
            account={account}
            vault={active}
            symbol={symbol}
          />
          <StackDivider h={"30px"} />
          <Button
            h={"40px"}
            minW={"100%"}
            mb={5}
            border="1px"
            borderStyle="solid"
            borderColor="gray.400"
            isLoading={loading}
            loadingText="Loading..."
            disabled={!parseInt(balance)}
            onClick={Withdraw}
          >
            Withdraw
          </Button>
        </>
      )}
    </VStack>
  );
}
