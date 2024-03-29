import { NextResponse } from 'next/server'
import type { NextApiResponse } from 'next'
import { message, App } from 'antd'

type ErrorWithMessage = { message: string }

export const getErrorMessage = (error: unknown): string => {
  function isErrorWithoutMessage(error: unknown): error is ErrorWithMessage {
    return (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as Record<string, unknown>).message === 'string'
    )
  }
  
  function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
    if(isErrorWithoutMessage(maybeError)) return maybeError

    try {
      return new Error(String(maybeError))
    } catch {
      return new Error(JSON.stringify(maybeError))
    }
  }

  return toErrorWithMessage(error).message
}

export const logServerError = (error: unknown): string => {
  let message = getErrorMessage(error)
  console.log('SERVER LOG:', message)
  return message
}

export const sendErrorToClient = (error: unknown) => {
  let message = logServerError(error)
  
  if(message) {
    return NextResponse.json(message, {status: 500})
  } else {
    return NextResponse.json("Server error", {status: 500})
  }
}