import React from 'react'
import styles from './css/About.module.css'
import PageTitle from '@/components/PageTitle'
import { FaBoxOpen, FaHome, FaInfoCircle, FaLightbulb, FaUnlockAlt, FaUser } from "react-icons/fa";
import { LuBoxes } from 'react-icons/lu';
import SectionTitle from '@/components/SectionTitle';
import { IoMdContact } from 'react-icons/io';
import { BiSolidContact } from 'react-icons/bi';
import { GiAxeInLog } from 'react-icons/gi';

const About = (): React.JSX.Element => {
  return (
    <div className={styles.container}>
      <PageTitle
        Icon={() => <FaInfoCircle/>}
        title='About'
      />
      
      <SectionTitle
        icon={() => <GiAxeInLog />}
        title={`Lumber Tycoon 2 Player's Possession`}
        size='28px'
      />

      <section>
        <p>
          Welcome to Lumber Tycoon 2 Player's Possession, a platform created to help Lumber Tycoon 2 players organize, manage, and audit their in-game item collections. Whether you own rare limited items or conventional items, this system allows you to keep track of your possessions, monitor their quantities and market values, and explore the collections of other registered players.
        </p>

        <p>
          Our goal is to provide a convenient and organized way for players to document their inventories, keep track of their collections, and have a better understanding of the items they own and their potential value within the Lumber Tycoon 2 community.
        </p>
      </section>

      <section>
        <div className={styles.section_title_container}>
          <SectionTitle
            icon={() => <FaHome/>}
            title='Home'
            size='20px'
          />

          <div className={styles.row}/>
        </div>

        <p>
          The Home page provides a quick overview of your account and your collection. You can see your registered contacts and access their profiles, as well as preview some of the items in your personal inventory. It also displays the total number of contacts and registered items, making it easier to keep track of your account activity and quickly navigate to the sections you use most.
        </p>
      </section>

      <section>
        <div className={styles.section_title_container}>
          <SectionTitle
            icon={() => <LuBoxes />}
            title='Items'
            size='20px'
          />

          <div className={styles.row}/>
        </div>

        <p>
          The Items section contains the platform's item catalog, where you can explore the items registered in the system. You can search for specific items by name and narrow down the results using filters such as category, state, and advanced filtering options.
        </p>

        <p>
          Each item displays relevant information, including its image, name, category, condition, original price, and average market price when available. This section helps players identify items, compare their information, and better understand their place within the game's trading community.
        </p>

        <p>
          Both limited and conventional items can be documented, making the catalog useful for players with different types of collections.
        </p>
      </section>

      <section>
        <div className={styles.section_title_container}>
          <SectionTitle
            icon={() => <FaBoxOpen />}
            title='My Items'
            size='20px'
          />

          <div className={styles.row}/>
        </div>

        <p>
          The My Items section is your personal inventory manager. Here, you can register the items you own, specify their quantities, and organize your collection in one place.
        </p>

        <p>
          You can add new items, update their information, adjust quantities, and remove items from your inventory whenever necessary. Search and filtering options make it easier to find specific entries, even when your collection contains many different items.
        </p>

        <p>
          Each registered item displays its category, state, image, quantity, and available price information. This allows you to maintain an organized record of your possessions and estimate the overall size and potential value of your collection.
        </p>

        <p>
          Whether you own a few common items or an extensive collection of rare and limited items, this section helps you keep everything documented.
        </p>
      </section>

      <section>
        <div className={styles.section_title_container}>
          <SectionTitle
            icon={() => <IoMdContact />}
            title='Contacts'
            size='20px'
          />

          <div className={styles.row}/>
        </div>         

        <p>
          The Contacts section allows you to discover and explore other players registered on Lumber Tycoon Player's Possession. You can search for users by their usernames and use advanced filters to find specific players more easily.
        </p>

        <p>
          Each player card provides a preview of their profile, including their username, profile picture, registration date, and the number of items they have registered. Depending on your relationship with that player, you can also see whether you are already connected, whether a contact request is pending, or whether you can send a new contact request.
        </p>

        <p>
          This section makes it easier to discover other collectors and explore the collections they have chosen to document on the platform.
        </p>
      </section>

      <section>      
        <div className={styles.section_title_container}>
          <SectionTitle
            icon={() => <BiSolidContact />}
            title='My Contacts'
            size='20px'
          />

          <div className={styles.row}/>
        </div>

        <p>
          The My Contacts section brings together the players with whom you have established or pending contact relationships.
        </p>

        <p>
          You can view your contacts, check their profile information, see how many items they have registered, and identify the current relationship status between you and each player.
        </p>

        <p>
          You can also search your contact list, filter users by relationship status, and manage your existing connections. This provides a convenient way to keep track of players you know and quickly access their collections.
        </p>
      </section>

      <section>          
        <div className={styles.section_title_container}>
          <SectionTitle
            icon={() => <FaUser />}
            title='Profile'
            size='20px'
          />

          <div className={styles.row}/>
        </div>

        <p>
          Every registered player has a profile containing information about their account and their documented collection.
        </p>

        <p>
          Your own profile allows you to view your public account information, such as your username, account identifier, Lumber Bucks balance, profile picture, and other available account details. You can also update your profile picture by providing an image URL or uploading an image.
        </p>

        <p>
          When viewing another player's profile, you can explore the information they have made available, including their username, account identifier, Lumber Bucks balance, number of contacts, total registered items, and registration date.
        </p>

        <p>
          You can also see their contact status and, when applicable, manage your relationship with that player. Below the profile information, you can browse their registered contacts and item collection.
        </p>

        <p>
          This makes player profiles an important part of the platform, allowing collectors to showcase their documented possessions and giving other players a better understanding of their collections.
        </p>
      </section>

      <section>
        <div className={styles.section_title_container}>
          <SectionTitle
            icon={() => <FaUnlockAlt />}
            title='Account Registration and Sign In'
            size='20px'
          />

          <div className={styles.row}/>
        </div>               

        <p>
          To use Lumber Tycoon Player's Possession, you need to create an account or sign in with an existing one. The registration process requires a username and password, while account creation also includes password confirmation.
        </p>

        <p>
          Once authenticated, you can access your personal inventory, manage contacts, explore other players' profiles, and use the platform's features.
        </p>

        <p>
          Your account provides a centralized place to maintain your collection records and interact with other registered players.
        </p>
      </section>

      <section>      
        <div className={styles.section_title_container}>
          <SectionTitle
            icon={() => <FaLightbulb />}
            title='Our Purpose'
            size='20px'
          />

          <div className={styles.row}/>
        </div>

        <p>
          Lumber Tycoon Player's Possession was created to bring more organization and transparency to the Lumber Tycoon 2 collecting community.
        </p>

        <p>
          In a game where players can own a wide variety of items, including rare limited collectibles and conventional items, keeping track of everything can become difficult. This platform aims to make that process easier by providing a centralized inventory system where players can register their possessions, record quantities, consult item information, and explore other players' documented collections.
        </p>

        <p>
          It is important to remember that Lumber Tycoon 2 Player's Possession is an independent inventory and collection management platform. The information displayed depends on what each player registers and maintains in the system. Item prices, including average market prices, are references for collection auditing and should not be interpreted as guaranteed trading values or official prices established by the game.
        </p>

        <p>
          Our mission is simple: help Lumber Tycoon 2 players organize their collections, keep track of their possessions, discover other collectors, and make their inventory information easier to access and understand.
        </p>

        <p>
          Thank you for being part of Lumber Tycoon 2 Player's Possession!
        </p>
      </section>
    </div>
  )
}

export default About