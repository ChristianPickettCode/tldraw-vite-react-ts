import { useStateDesigner } from "@state-designer/react";
import { Renderer } from "@tldraw/core";
import { Fragment, useEffect, useState } from "react";
import { Api } from "./state/api";
import styled from "./stitches.config";
import { Toolbar } from "./components/Toolbar";
import { shapeUtils } from "./shapes";
import { machine } from "./state/machine";
import "./styles.css";
import * as EventHandler from "./eventhandlers";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { nanoid } from "nanoid";
import daiABI from "./dai_abi.json";
import { ethers } from "ethers";
import axios from "axios"

declare const window: Window & { api: Api, ethereum: any };

interface AppProps {
  onMount?: (api: Api) => void;
}

export default function App({ onMount }: AppProps) {
  const appState = useStateDesigner(machine);
  const api = new Api(appState);
  const [provider, setProvider] = useState();
  const [signer, setSignner] = useState();

  const [args, setArgs] : any = useState({});
  const [search, setSearch] = useState("");

  const [queriedABI, setQueriedABI] = useState("")
  const [queriedAddr, setQueriedAddr] = useState("")

  useEffect(() => {
    onMount?.(api);
    window["api"] = api;

    // console.log(process)
    // console.log(process.env)
    // const iface = new ethers.Interface(jsonAbi);
  }, []);

  const connect = async () => {
    const p = new ethers.providers.Web3Provider(window.ethereum);
    await p.send("eth_requestAccounts", []);
    const s = p.getSigner();
    const addr = await s.getAddress();
    console.log(addr);
  };

  const send = () => {
    const p = new ethers.providers.Web3Provider(window.ethereum);
    const s = p.getSigner();
    const tx = s.sendTransaction({
      to: "ethers.eth",
      value: ethers.utils.parseEther("0.0001"),
    });
  };

  const searchABI = () => {
    const contractAddr = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
    const apiKey = import.meta.env.ETHERSCAN_API
    // WETH MAINNET CONTRACT ADDR ; 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2 - FOR ETHERSCAN TO RETRIEVE ABI
    axios.get(`https://api.etherscan.io/api?module=contract&action=getabi&address=${search}&apikey=${apiKey}`)
    .then(function (response) {
      // handle success
      console.log(response);
      if (response.data.status === '1') {
        console.log("Success")
        console.log(response.data.result)
        setQueriedABI(response.data.result)
      } else {
        console.log(response.data.result)
      }
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })

  }

  const abi = async () => {
    const p = new ethers.providers.Web3Provider(window.ethereum);
    const s = p.getSigner();
    const addr = await s.getAddress();
    // console.log(JSON.stringify(JSON.parse(daiABI), null, 2));

    var ABI = queriedABI ? queriedABI : daiABI
    const daiContract = new ethers.Contract(
      "0xf2edF1c091f683E3fb452497d9a98A49cBA84666",
      ABI,
      p
    );
    const name = await daiContract.name();
    console.log(name);

    const symbol = await daiContract.symbol();
    console.log(symbol);

    const balance = await daiContract.balanceOf(
      "0xf4c5c4dedde7a86b25e7430796441e209e23ebfb"
    );
    console.log(ethers.utils.formatUnits(balance, 18));
    console.log(daiContract.functions);

    const iface = new ethers.utils.Interface(ABI);
    console.log(iface.format(ethers.utils.FormatTypes.full));
    console.log(iface.format(ethers.utils.FormatTypes.minimal)[8]);
    console.log(iface.format(ethers.utils.FormatTypes.full)[8]);

    var func = iface.format(ethers.utils.FormatTypes.minimal)[8].split(" ")[1];
    console.log(func);
    var func_name = iface.getFunction(func).name;
    console.log(func_name);
    console.log(
      ethers.utils.formatUnits(
        await daiContract[func_name](
          "0xf4c5c4dedde7a86b25e7430796441e209e23ebfb"
        )
      )
    );

    func = iface.format(ethers.utils.FormatTypes.minimal)[21].split(" ")[1];
    console.log(func);
    func_name = iface.getFunction(func).name;
    console.log(func_name);
    console.log(ethers.utils.formatUnits(await daiContract[func_name]()));
  };

  const addBox = () => {
    api.createShapes({ id: nanoid(), type: "box" });
  };

  const addArrow = () => {
    api.createShapes({ id: nanoid(), type: "arrow" });
  };

  const callFunc = async (name: string, details: any) => {
    console.log(`Calling func....${name}`);
    const p = new ethers.providers.Web3Provider(window.ethereum);
    var ABI = queriedABI ? queriedABI : daiABI
    var ADDR = queriedAddr ? queriedAddr : "0xf2edF1c091f683E3fb452497d9a98A49cBA84666"
    console.log('ADDR', ADDR)

    // WETH GOERLI CONTRACT ADDR ; 0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6 - CONTRACT OBJ ADDR
    const contract = new ethers.Contract(
      ADDR,
      ABI,
      p
    );

    console.log(contract)
    console.log(name);
    console.log(details);

    var arg_list: string[] = [];
    details.inputs.map((_: string, i: string) => {
      var arg_name : string = `${name}-${i}`;
      console.log(`PARAM VALS : ${args[arg_name]}`);
      arg_list.push(args[arg_name]);
    });

    console.log(arg_list);

    var res = await contract[name](...arg_list);

    // res.type === BigNumber
    console.log(res.constructor.name);

    switch (res.constructor.name) {
      case "BigNumber":
        console.log(ethers.utils.formatUnits(res));
        break;

      default:
        console.log(res);
        break;
    }
  };

  const populate = () => {
    var ABI = queriedABI ? queriedABI : daiABI
    const iface = new ethers.utils.Interface(ABI);
    const functions = iface.format(ethers.utils.FormatTypes.minimal) as string[]

    return (
      <>
        {functions.map((item: string, i: number) => {
          if (item.split(" ")[0] == "function") {
            const func_name = item.split(" ")[1];
            const func_details = iface.getFunction(func_name);
            return (
              <div
                key={i}
                className="w-128 focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
              >
                <h3>{item}</h3>
                {func_details.inputs.map((param, i) => {
                  return (
                    <div>
                      <p>{`${param.name} - ${param.type}\n`} </p>
                      <input
                        type="text"
                        className="text-black"
                        onChange={(e) =>
                          setArgs((prev:any) => ({
                            ...prev,
                            [`${func_name}-${i}`]: e.target.value,
                          }))
                        }
                      />
                    </div>
                  );
                })}
                <button
                  onClick={() => callFunc(func_name, func_details)}
                  type="button"
                  className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                >
                  Run
                </button>
              </div>
            );
          }
        })}

        {/* <GreenButton /> */}
        {/* <RedButton />
        <YellowButton />
        <PurpleButton />
        <BlueButtton /> */}
      </>
    );
  };

  const GreenButton = () => {
    return (
      <button
        onClick={() => addBox()}
        type="button"
        className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
      >
        Add Box
      </button>
    );
  };

  const RedButton = () => {
    return (
      <button
        onClick={() => addArrow()}
        type="button"
        className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
      >
        Add Arrow
      </button>
    );
  };

  const YellowButton = () => {
    return (
      <button
        onClick={connect}
        type="button"
        className="focus:outline-none text-white bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:focus:ring-yellow-900"
      >
        Connect
      </button>
    );
  };

  const PurpleButton = () => {
    return (
      <button
        onClick={send}
        type="button"
        className="focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
      >
        Send
      </button>
    );
  };

  const BlueButtton = () => {
    return (
      <button
        onClick={abi}
        type="button"
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
      >
        Default
      </button>
    );
  };

  const hideBounds = appState.isInAny(
    "transformingSelection",
    "translating",
    "creating"
  );

  const user = {
    name: "Tom Cook",
    email: "tom@example.com",
    imageUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  };
  const navigation = [
    { name: "Dashboard", href: "#", current: true },
    { name: "Team", href: "#", current: false },
    { name: "Projects", href: "#", current: false },
    { name: "Calendar", href: "#", current: false },
    { name: "Reports", href: "#", current: false },
  ];
  const userNavigation = [
    { name: "Your Profile", href: "#" },
    { name: "Settings", href: "#" },
    { name: "Sign out", href: "#" },
  ];

  const firstShapeId = appState.data.pageState.selectedIds[0];
  const firstShape = firstShapeId
    ? appState.data.page.shapes[firstShapeId]
    : null;
  const hideResizeHandles = firstShape
    ? appState.data.pageState.selectedIds.length === 1 &&
      (shapeUtils[firstShape.type] as any).hideResizeHandles
    : false;

  function classNames(...classes: any[]) {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <>
      <div className="min-h-full">
        <Disclosure as="nav" className="bg-gray-800">
          {({ open }) => (
            <>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <img
                        className="h-8 w-8"
                        src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                        alt="Your Company"
                      />
                    </div>
                    <div className="hidden md:block">
                      <div className="ml-10 flex items-baseline space-x-4">
                        {navigation.map((item) => (
                          <a
                            key={item.name}
                            href={item.href}
                            className={classNames(
                              item.current
                                ? "bg-gray-900 text-white"
                                : "text-gray-300 hover:bg-gray-700 hover:text-white",
                              "px-3 py-2 rounded-md text-sm font-medium"
                            )}
                            aria-current={item.current ? "page" : undefined}
                          >
                            {item.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="ml-4 flex items-center md:ml-6">
                      <button
                        type="button"
                        className="rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                      >
                        <span className="sr-only">View notifications</span>
                        <BellIcon className="h-6 w-6" aria-hidden="true" />
                      </button>

                      {/* Profile dropdown */}
                      <Menu as="div" className="relative ml-3">
                        <div>
                          <Menu.Button className="flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                            <span className="sr-only">Open user menu</span>
                            <img
                              className="h-8 w-8 rounded-full"
                              src={user.imageUrl}
                              alt=""
                            />
                          </Menu.Button>
                        </div>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            {userNavigation.map((item) => (
                              <Menu.Item key={item.name}>
                                {({ active }) => (
                                  <a
                                    href={item.href}
                                    className={classNames(
                                      active ? "bg-gray-100" : "",
                                      "block px-4 py-2 text-sm text-gray-700"
                                    )}
                                  >
                                    {item.name}
                                  </a>
                                )}
                              </Menu.Item>
                            ))}
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </div>
                  </div>
                  <div className="-mr-2 flex md:hidden">
                    {/* Mobile menu button */}
                    <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XMarkIcon
                          className="block h-6 w-6"
                          aria-hidden="true"
                        />
                      ) : (
                        <Bars3Icon
                          className="block h-6 w-6"
                          aria-hidden="true"
                        />
                      )}
                    </Disclosure.Button>
                  </div>
                </div>
              </div>

              <Disclosure.Panel className="md:hidden">
                <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
                  {navigation.map((item) => (
                    <Disclosure.Button
                      key={item.name}
                      as="a"
                      href={item.href}
                      className={classNames(
                        item.current
                          ? "bg-gray-900 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white",
                        "block px-3 py-2 rounded-md text-base font-medium"
                      )}
                      aria-current={item.current ? "page" : undefined}
                    >
                      {item.name}
                    </Disclosure.Button>
                  ))}
                </div>
                <div className="border-t border-gray-700 pt-4 pb-3">
                  <div className="flex items-center px-5">
                    <div className="flex-shrink-0">
                      <img
                        className="h-10 w-10 rounded-full"
                        src={user.imageUrl}
                        alt=""
                      />
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium leading-none text-white">
                        {user.name}
                      </div>
                      <div className="text-sm font-medium leading-none text-gray-400">
                        {user.email}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="ml-auto flex-shrink-0 rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                    >
                      <span className="sr-only">View notifications</span>
                      <BellIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="mt-3 space-y-1 px-2">
                    {userNavigation.map((item) => (
                      <Disclosure.Button
                        key={item.name}
                        as="a"
                        href={item.href}
                        className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                      >
                        {item.name}
                      </Disclosure.Button>
                    ))}
                  </div>
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        <header className="bg-white shadow">
          <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Dashboard
            </h1>
          </div>
        </header>
        <main>
          <div className="max-h-8 mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
            {/* Replace with your content */}
            <div className="px-4 py-6 sm:px-0">
              <form>
                <label
                  htmlFor="default-search"
                  className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
                >
                  Search
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg
                      aria-hidden="true"
                      className="w-5 h-5 text-gray-500 dark:text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      ></path>
                    </svg>
                  </div>
                  <input
                    type="search"
                    // id="default-search"
                    className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Contract address..."
                    required
                    onChange={e => setSearch(e.target.value)}
                  />
                  <button
                    onClick={(e) => {e.preventDefault(); searchABI()}}
                    type="submit"
                    className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  >
                    Search
                  </button>
                </div>
              </form>

              <form>
                <label
                  htmlFor="default-search"
                  className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
                >
                  Search
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg
                      aria-hidden="true"
                      className="w-5 h-5 text-gray-500 dark:text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      ></path>
                    </svg>
                  </div>
                  <input
                    type="search"
                    // id="default-search"
                    className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Abi address..."
                    required
                    onChange={e => setQueriedAddr(e.target.value)}
                  />
                  <button
                    onClick={(e) => {e.preventDefault(); searchABI()}}
                    type="submit"
                    className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  >
                    Search
                  </button>
                </div>
              </form>

              <div className="mb-9 rounded-lg border-4 border-dashed border-gray-200">
                {/* <Renderer
                  shapeUtils={shapeUtils} // Required
                  page={appState.data.page} // Required
                  pageState={appState.data.pageState} // Required
                  performanceMode={appState.data.performanceMode}
                  meta={appState.data.meta}
                  snapLines={appState.data.overlays.snapLines}
                  onPointShape={EventHandler.onPointShape}
                  onPointBounds={EventHandler.onPointBounds}
                  onPointCanvas={EventHandler.onPointCanvas}
                  onPointerDown={EventHandler.onPointerDown}
                  onPointerMove={EventHandler.onPointerMove}
                  onHoverShape={EventHandler.onHoverShape}
                  onUnhoverShape={EventHandler.onUnhoverShape}
                  onPointBoundsHandle={EventHandler.onPointBoundsHandle}
                  onPointHandle={EventHandler.onPointHandle}
                  onPan={EventHandler.onPan}
                  onPinchStart={EventHandler.onPinchStart}
                  onPinchEnd={EventHandler.onPinchEnd}
                  onPinch={EventHandler.onPinch}
                  onPointerUp={EventHandler.onPointerUp}
                  onBoundsChange={EventHandler.onBoundsChange}
                  onKeyDown={EventHandler.onKeyDown}
                  onKeyUp={EventHandler.onKeyUp}
                  hideBounds={hideBounds}
                  hideHandles={hideBounds}
                  hideResizeHandles={hideResizeHandles}
                  hideIndicators={hideBounds}
                  hideBindingHandles={true}
                />
                <Toolbar
                  activeStates={appState.active}
                  lastEvent={appState.log[0]}
                /> */}

                {populate()}
              </div>
            </div>
            {/* /End replace */}
          </div>
        </main>
      </div>
    </>
  );
}

const AppContainer = styled("div", {
  position: "fixed",
  top: "0px",
  left: "0px",
  right: "0px",
  bottom: "0px",
  width: "100%",
  height: "100%",
  zIndex: 101,
});
