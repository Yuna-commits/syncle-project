import React from 'react'
import { Link } from 'react-router-dom'

export default function AuthFooterLink({ text, linkText, to }) {
  return (
    <p className="mt-5 text-left text-sm text-gray-700">
      {text}{' '}
      <Link to={to} className="text-blue-500 hover:text-blue-600">
        {linkText}
      </Link>
    </p>
  )
}
