import { useState, useEffect, useRef } from "react";
import {
  VStack,
  StackDivider,
  Button,
  Text,
  Input,
  Image,
} from "@chakra-ui/react";
import BeatLoader from "react-spinners/BeatLoader";

import logo from "../assets/images/BlocksuranceWeb1.png";
const REGISTAR_ABI = require("../assets/registar-abi.json");
const REGISTAR_ADDRESS = process.env.REACT_APP_REGISTAR_ADDRESS;

export default function Registar(props: any) {
  const web3 = props.web3;
  const account = props.account;

  const [refcode, setRefcode] = useState<string>("");
  const [valid, setValid] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  var registarContract = new web3.eth.Contract(REGISTAR_ABI, REGISTAR_ADDRESS);

  var isMounted = useRef(false);

  useEffect(() => {
    async function isValidAddress() {
      return (await web3.utils.isAddress(refcode)) === true;
    }
    setLoading(false);
    isMounted.current = true;
    isValidAddress()
      .then((res: any) => {
        if (isMounted.current) {
          setValid(res);
          // console.log(res);
        }
      })
      .catch((e: any) => {
        console.log(e);
      });

    return () => {
      // executed when unmount
      isMounted.current = false;
    };
  }, [refcode, web3]);

  // useEffect(() => {
  //   isMounted.current = true;
  //   var rContract = new web3.eth.Contract(REGISTAR_ABI, REGISTAR_ADDRESS);
  //   rContract.methods
  //     .get(account, API_KEY)
  //     .call({ from: account })
  //     .then(function (result: boolean) {
  //       // console.log(result);
  //       if (isMounted.current) {
  //         setRegistered(result);
  //       }
  //     });

  //   return () => {
  //     isMounted.current = false;
  //   };
  // }, [account, web3]);

  function register() {
    setLoading(true);

    registarContract.methods
      .register(refcode)
      .send({
        from: account,
        gasLimit: 3000000,
      })
      .then((res: any) => {
        console.log("Registered successfully!");
        props.regComplete();
      })
      .catch((e: any) => {
        console.log(e);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <VStack
      w="100%"
      alignItems={"center"}
      verticalAlign={"center"}
      spacing={"20px"}
      //divider={<StackDivider h={"50px"} />}
    >
      <Image src={logo} alt="" w={"300px"} />

      <>
        <Text fontSize="xl">Welcome!</Text>
        <Text fontSize="md">Enter your invite code!</Text>
        <Input
          w={"80%"}
          border="1px"
          borderStyle="solid"
          borderColor="blue.300"
          style={{ textAlign: "center" }}
          placeholder={"Refferal code"}
          value={refcode}
          maxW={"3xl"}
          onChange={(e) => {
            setRefcode(e.target.value);
          }}
        />
      </>

      <StackDivider h={"20px"} />

      <Button
        h={"40px"}
        minW={"80%"}
        border="1px"
        borderStyle="solid"
        borderColor="gray.400"
        isLoading={loading}
        spinner={<BeatLoader size={8} color="white" />}
        onClick={register}
        disabled={!valid}
      >
        Register
      </Button>

      <StackDivider h={"20px"} />
    </VStack>
  );
}
