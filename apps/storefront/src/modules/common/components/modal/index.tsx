import { Dialog, Transition } from "@headlessui/react"
import { clx } from "@modules/common/components/ui"
import { Xmark } from "iconoir-react"
import React, { Fragment } from "react"

import { ModalProvider, useModal } from "@lib/context/modal-context"

type ModalProps = {
  isOpen: boolean
  close: () => void
  size?: "small" | "medium" | "large"
  search?: boolean
  mobileSheet?: boolean
  children: React.ReactNode
  "data-testid"?: string
}

const Modal = ({
  isOpen,
  close,
  size = "medium",
  search = false,
  mobileSheet = false,
  children,
  "data-testid": dataTestId,
}: ModalProps) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className={clx("relative z-[75]", {
          "sg-responsive-modal-root": mobileSheet,
        })}
        onClose={close}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="sg-modal__backdrop fixed inset-0 bg-opacity-75 backdrop-blur-md h-screen" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-hidden">
          <div
            className={clx(
              "sg-modal__layout flex min-h-full h-full justify-center p-4 text-center",
              {
                "items-center": !search,
                "items-start": search,
              }
            )}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-[220ms]"
              enterFrom="opacity-0 scale-95 sg-responsive-modal-enter-from"
              enterTo="opacity-100 scale-100 sg-responsive-modal-enter-to"
              leave="ease-in duration-[220ms]"
              leaveFrom="opacity-100 scale-100 sg-responsive-modal-leave-from"
              leaveTo="opacity-0 scale-95 sg-responsive-modal-leave-to"
            >
              <Dialog.Panel
                data-testid={dataTestId}
                className={clx(
                  "flex flex-col justify-start w-full transform p-5 text-left align-middle transition-all max-h-[75vh] h-fit",
                  {
                    "max-w-md": size === "small",
                    "max-w-xl": size === "medium",
                    "max-w-3xl": size === "large",
                    "bg-transparent shadow-none": search,
                    "bg-white shadow-xl border rounded-rounded": !search,
                    "sg-responsive-modal": mobileSheet,
                  }
                )}
              >
                {mobileSheet && (
                  <span className="sg-responsive-modal__handle" aria-hidden="true" />
                )}
                <ModalProvider close={close}>{children}</ModalProvider>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

const Title: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { close } = useModal()

  return (
    <Dialog.Title className="sg-modal__title flex items-center justify-between">
      <div className="text-large-semi">{children}</div>
      <div>
        <button onClick={close} data-testid="close-modal-button">
          <Xmark width={24} height={24} aria-hidden="true" />
        </button>
      </div>
    </Dialog.Title>
  )
}

const Description: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Dialog.Description className="flex text-small-regular text-ui-fg-base items-center justify-center pt-2 pb-4 h-full">
      {children}
    </Dialog.Description>
  )
}

const Body: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="sg-modal__body flex justify-center">{children}</div>
}

const Footer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="sg-modal__footer flex items-center justify-end gap-x-4">
      {children}
    </div>
  )
}

Modal.Title = Title
Modal.Description = Description
Modal.Body = Body
Modal.Footer = Footer

export default Modal
