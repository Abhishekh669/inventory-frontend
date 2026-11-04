import Link from 'next/link'

function page() {
  return (
    <div><Link href={"/login"}>Go to login</Link></div>
  )
}

export default page