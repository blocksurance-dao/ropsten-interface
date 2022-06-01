import { useState, useEffect, useRef } from "react";
import {
  Box,
  Flex,
  VStack,
  Text,
  HStack,
  Link,
  Image,
  Button,
  useColorMode,
} from "@chakra-ui/react";

import { ExternalLinkIcon } from "@chakra-ui/icons";
import InfiniteScroll from "react-infinite-scroll-component";
import useWindowDimensions from "../hooks/useWindowDimensions";
const CONTRACT_ADDRESS = process.env.REACT_APP_FAUCET_ADDRESS;
const CONTRACT_ABI = require("../assets/faucet-abi.json");
const TOKENLIST = require("../assets/TokenList.json");

export default function Faucet(props: any) {
  const web3 = props.web3;
  const account = props.account;
  const { width } = useWindowDimensions();

  const [tlink, setTLink] = useState<any>("");
  const [tokens, setTokens] = useState<any>([]);
  const amount = 200;
  const price = 10000;
  const [loading, setLoading] = useState<boolean>(false);

  var isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    if (isMounted.current && TOKENLIST?.tokens?.length) {
      setTokens(TOKENLIST?.tokens?.slice(1, 7));
    }
    return () => {
      isMounted.current = false;
    };
  }, []);

  async function buyTokens(tokenAddress: string) {
    setLoading(true);
    if (!account?.length) {
      alert("Connect wallet!");
      return;
    }
    if (amount) {
      const faucetContract = new web3.eth.Contract(
        CONTRACT_ABI,
        CONTRACT_ADDRESS
      );
      const value = (1 / price) * amount;
      const weiValue = web3.utils.toWei(value.toString(), "ether");
      let tx = await faucetContract.methods.buyTokens(tokenAddress).send({
        from: account,
        value: weiValue,
        gasLimit: 3000000,
      });

      /**
       * tx.hash is transaction id that we can use to create etherscan link
       */
      if (tx?.transactionHash) {
        console.log("Transaction:", tx.transactionHash);
        // console.log(network);

        setTLink(tx.transactionHash);
        props.updateBalance();
      }
    }
    setLoading(false);
  }

  const fetchMoreData = () => {
    setTimeout(() => {
      if (tokens.length < TOKENLIST?.tokens?.length) {
        const moreTokens = TOKENLIST.tokens.slice(0, tokens.length + 10);
        setTokens(moreTokens);
      }
    }, 1000);
  };

  function ListItem({ children, ...props }: any) {
    const item = props.item;
    const { colorMode } = useColorMode();
    const [copied, setCopied] = useState<any>(false);

    return (
      <Box
        bg={colorMode === "dark" ? "gray.700" : "gray.100"}
        w="100%"
        p={"5px"}
        mt={"3px"}
        border="3px"
        borderStyle="solid"
        borderRadius="5px"
        borderColor={colorMode === "dark" ? "gray.700" : "gray.100"}
      >
        <HStack justifyContent="space-between">
          <Box w={"50px"}>
            <Image src={item.logoURI} alt="" />
          </Box>
          <Box w={"180px"}>
            <Text fontSize="sm">{item.name}</Text>
            <Text fontSize="sm">{item.symbol}</Text>
          </Box>
          <Link
            fontSize="sm"
            display="flex"
            alignItems="center"
            href={`https://rinkeby.etherscan.io/address/${item.address}`}
            isExternal
            color="gray.400"
            _hover={{
              color: "whiteAlpha.800",
              textDecoration: "underline",
            }}
          >
            <ExternalLinkIcon m={"8px"} w={5} h={5} color={"blue.400"} />
          </Link>
          <Button
            w="150px"
            minW="150px"
            border="1px"
            justifyContent="space-between"
            bg={colorMode === "dark" ? "#3D4756" : "gray.300"}
            borderColor={colorMode === "dark" ? "gray.700" : "gray.300"}
            _hover={{
              border: "1px",
              borderStyle: "solid",
              borderColor: "blue.400",
              backgroundColor: colorMode === "dark" ? "gray.600" : "blue.200",
            }}
            borderRadius="md"
            m="1px"
            px={3}
            height="38px"
            disabled={loading}
            onClick={() => {
              setCopied(!copied);
              buyTokens(item.address);
            }}
          >
            <Text fontSize="md" fontWeight="medium">
              SEND ME 200
            </Text>
          </Button>
        </HStack>
      </Box>
    );
  }

  return (
    <Flex align="center" justify="center" padding="25px" minH="90vh">
      <Box
        mt={"80px"}
        minW={width > 600 ? "80%" : "95%"}
        minH="70vh"
        alignSelf="center"
        border={width > 450 ? "1px" : "0px"}
        borderStyle="solid"
        borderColor="gray.600"
        borderRadius="3xl"
        padding={width > 600 ? "50px" : "20px"}
        // bgGradient="linear(to-t, purple.800, gray.700)"
      >
        <VStack
          w="100%"
          flexDirection="column"
          alignItems="space-between"
          justifyContent="center"
        >
          <InfiniteScroll
            dataLength={tokens.length}
            next={fetchMoreData}
            hasMore={tokens.length < TOKENLIST?.tokens?.length}
            loader={<h4>Loading...</h4>}
          >
            {tokens?.length &&
              tokens.map((item: any, index: number) => (
                <ListItem key={index} item={item} />
              ))}
          </InfiniteScroll>
        </VStack>
        {tlink && (
          <Link
            fontSize="sm"
            display="flex"
            alignItems="center"
            href={`https://rinkeby.etherscan.io/address/${tlink}`}
            isExternal
            color="gray.400"
            ml={6}
            p={5}
            _hover={{
              color: "whiteAlpha.800",
              textDecoration: "underline",
            }}
          >
            Confirmed: <ExternalLinkIcon m={2} w={5} h={5} color="blue.400" />
          </Link>
        )}
      </Box>
    </Flex>
  );
}
